#include <mapnik/image.hpp>
#include <mapnik/version.hpp>
#include <mapnik/image_reader.hpp>

#include "zlib.h"

#if defined(HAVE_PNG)
#include <mapnik/png_io.hpp>
#endif

#if defined(HAVE_JPEG)
#define XMD_H
#include <mapnik/jpeg_io.hpp>
#undef XMD_H
#endif

#if defined(HAVE_WEBP)
#include <mapnik/webp_io.hpp>
#endif

#include "mapnik_palette.hpp"
#include "blend.hpp"
#include "tint.hpp"

#include <sstream>
#include <cstring>
#include <cstdlib>
#include <memory>

using namespace v8;
using namespace node;

namespace node_mapnik {

/**
 * This method moves a hex to a color
 * @name hexToUInt32Color
 * @param {string} hex
 * @returns {number} color
 */
static bool hexToUInt32Color(char *hex, unsigned int & value) {
    if (!hex) return false;
    int len_original = strlen(hex);
    // Return is the length of the string is less then six
    // otherwise the line after this could go to some other
    // pointer in memory, resulting in strange behaviours.
    if (len_original < 6) return false; 
    if (hex[0] == '#') hex++;
    int len = strlen(hex);
    if (len != 6 && len != 8) return false;

    unsigned int color = 0;
    std::stringstream ss;
    ss << std::hex << hex;
    ss >> color;

    if (len == 8) {
        // Circular shift to get from RGBA to ARGB.
        value = (color << 24) | ((color & 0xFF00) << 8) | ((color & 0xFF0000) >> 8) | ((color & 0xFF000000) >> 24);
        return true;
    } else {
        value = 0xFF000000 | ((color & 0xFF) << 16) | (color & 0xFF00) | ((color & 0xFF0000) >> 16);
        return true;
    }
}

NAN_METHOD(rgb2hsl) {
    NanScope();
    if (args.Length() != 3) {
        NanThrowTypeError("Please pass r,g,b integer values as three arguments");
        NanReturnUndefined();
    }
    if (!args[0]->IsNumber() || !args[1]->IsNumber() || !args[2]->IsNumber()) {
        NanThrowTypeError("Please pass r,g,b integer values as three arguments");
        NanReturnUndefined();
    }
    unsigned r,g,b;
    r = args[0]->IntegerValue();
    g = args[1]->IntegerValue();
    b = args[2]->IntegerValue();
    Local<Array> hsl = NanNew<Array>(3);
    double h,s,l;
    rgb_to_hsl(r,g,b,h,s,l);
    hsl->Set(0,NanNew<Number>(h));
    hsl->Set(1,NanNew<Number>(s));
    hsl->Set(2,NanNew<Number>(l));
    NanReturnValue(hsl);
}

NAN_METHOD(hsl2rgb) {
    NanScope();
    if (args.Length() != 3) {
        NanThrowTypeError("Please pass hsl fractional values as three arguments");
        NanReturnUndefined();
    }
    if (!args[0]->IsNumber() || !args[1]->IsNumber() || !args[2]->IsNumber()) {
        NanThrowTypeError("Please pass hsl fractional values as three arguments");
        NanReturnUndefined();
    }
    double h,s,l;
    h = args[0]->NumberValue();
    s = args[1]->NumberValue();
    l = args[2]->NumberValue();
    Local<Array> rgb = NanNew<Array>(3);
    unsigned r,g,b;
    hsl_to_rgb(h,s,l,r,g,b);
    rgb->Set(0,NanNew<Integer>(r));
    rgb->Set(1,NanNew<Integer>(g));
    rgb->Set(2,NanNew<Integer>(b));
    NanReturnValue(rgb);
}

static void parseTintOps(Local<Object> const& tint, Tinter & tinter, std::string & msg) {
    NanScope();
    Local<Value> hue = tint->Get(NanNew("h"));
    if (!hue.IsEmpty() && hue->IsArray()) {
        Local<Array> val_array = Local<Array>::Cast(hue);
        if (val_array->Length() != 2) {
            msg = "h array must be a pair of values";
        }
        tinter.h0 = val_array->Get(0)->NumberValue();
        tinter.h1 = val_array->Get(1)->NumberValue();
    }
    Local<Value> sat = tint->Get(NanNew("s"));
    if (!sat.IsEmpty() && sat->IsArray()) {
        Local<Array> val_array = Local<Array>::Cast(sat);
        if (val_array->Length() != 2) {
            msg = "s array must be a pair of values";
        }
        tinter.s0 = val_array->Get(0)->NumberValue();
        tinter.s1 = val_array->Get(1)->NumberValue();
    }
    Local<Value> light = tint->Get(NanNew("l"));
    if (!light.IsEmpty() && light->IsArray()) {
        Local<Array> val_array = Local<Array>::Cast(light);
        if (val_array->Length() != 2) {
            msg = "l array must be a pair of values";
        }
        tinter.l0 = val_array->Get(0)->NumberValue();
        tinter.l1 = val_array->Get(1)->NumberValue();
    }
    Local<Value> alpha = tint->Get(NanNew("a"));
    if (!alpha.IsEmpty() && alpha->IsArray()) {
        Local<Array> val_array = Local<Array>::Cast(alpha);
        if (val_array->Length() != 2) {
            msg = "a array must be a pair of values";
        }
        tinter.a0 = val_array->Get(0)->NumberValue();
        tinter.a1 = val_array->Get(1)->NumberValue();
    }
}

static inline void Blend_CompositePixel(unsigned int& target, unsigned int const& source) {
    if (source <= 0x00FFFFFF) {
        // Top pixel is fully transparent.
        // <do nothing>
    } else if (source >= 0xFF000000 || target <= 0x00FFFFFF) {
        // Top pixel is fully opaque or bottom pixel is fully transparent.
        target = source;
    } else {
        // Both pixels have transparency.
        // From http://trac.mapnik.org/browser/trunk/include/mapnik/graphics.hpp#L337
        long a1 = (source >> 24) & 0xff;
        long r1 = source & 0xff;
        long g1 = (source >> 8) & 0xff;
        long b1 = (source >> 16) & 0xff;

        long a0 = (target >> 24) & 0xff;
        long r0 = (target & 0xff) * a0;
        long g0 = ((target >> 8) & 0xff) * a0;
        long b0 = ((target >> 16) & 0xff) * a0;

        a0 = ((a1 + a0) << 8) - a0 * a1;
        r0 = ((((r1 << 8) - r0) * a1 + (r0 << 8)) / a0);
        g0 = ((((g1 << 8) - g0) * a1 + (g0 << 8)) / a0);
        b0 = ((((b1 << 8) - b0) * a1 + (b0 << 8)) / a0);
        a0 = a0 >> 8;
        target = (a0 << 24) | (b0 << 16) | (g0 << 8) | (r0);
    }
}

static inline void TintPixel(unsigned & r,
                      unsigned & g,
                      unsigned & b,
                      Tinter const& tint) {
    double h;
    double s;
    double l;
    rgb_to_hsl(r,g,b,h,s,l);
    double h2 = tint.h0 + (h * (tint.h1 - tint.h0));
    double s2 = tint.s0 + (s * (tint.s1 - tint.s0));
    double l2 = tint.l0 + (l * (tint.l1 - tint.l0));
    if (h2 > 1) h2 = 1;
    if (h2 < 0) h2 = 0;
    if (s2 > 1) s2 = 1;
    if (s2 < 0) s2 = 0;
    if (l2 > 1) l2 = 1;
    if (l2 < 0) l2 = 0;
    hsl_to_rgb(h2,s2,l2,r,g,b);
}


static void Blend_Composite(unsigned int *target, BlendBaton *baton, BImage *image) {
    const unsigned int *source = image->im_ptr->data();

    int sourceX = std::max(0, -image->x);
    int sourceY = std::max(0, -image->y);
    int sourcePos = sourceY * image->width + sourceX;

    int width = image->width - sourceX - std::max(0, image->x + image->width - baton->width);
    int height = image->height - sourceY - std::max(0, image->y + image->height - baton->height);

    int targetX = std::max(0, image->x);
    int targetY = std::max(0, image->y);
    int targetPos = targetY * baton->width + targetX;
    bool tinting = !image->tint.is_identity();
    bool set_alpha = !image->tint.is_alpha_identity();
    if (tinting || set_alpha) {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                unsigned int const& source_pixel = source[sourcePos + x];
                unsigned a = (source_pixel >> 24) & 0xff;
                if (set_alpha) {
                    double a2 = image->tint.a0 + (a/255.0 * (image->tint.a1 - image->tint.a0));
                    if (a2 < 0) a2 = 0;
                    a = static_cast<unsigned>(std::floor((a2 * 255.0)+.5));
                    if (a > 255) a = 255;
                }
                unsigned r = source_pixel & 0xff;
                unsigned g = (source_pixel >> 8 ) & 0xff;
                unsigned b = (source_pixel >> 16) & 0xff;
                if (a > 1 && tinting) {
                    TintPixel(r,g,b,image->tint);
                }
                unsigned int new_pixel = (a << 24) | (b << 16) | (g << 8) | (r);
                Blend_CompositePixel(target[targetPos + x], new_pixel);
            }
            sourcePos += image->width;
            targetPos += baton->width;
        }
    } else {
        for (int y = 0; y < height; y++) {
            for (int x = 0; x < width; x++) {
                Blend_CompositePixel(target[targetPos + x], source[sourcePos + x]);
            }
            sourcePos += image->width;
            targetPos += baton->width;
        }
    }
}

static void Blend_Encode(mapnik::image_rgba8 const& image, BlendBaton* baton, bool alpha) {
    try {
        if (baton->format == BLEND_FORMAT_JPEG) {
#if defined(HAVE_JPEG)
            if (baton->quality == 0) baton->quality = 85;
            mapnik::save_as_jpeg(baton->stream, baton->quality, image);
#else
            baton->message = "Mapnik not built with jpeg support";
#endif
        } else if (baton->format == BLEND_FORMAT_WEBP) {
#if defined(HAVE_WEBP)
            if (baton->quality == 0) baton->quality = 80;
            WebPConfig config;
            // Default values set here will be lossless=0 and quality=75 (as least as of webp v0.3.1)
            if (!WebPConfigInit(&config)) {
                /* LCOV_EXCL_START */
                baton->message = "WebPConfigInit failed: version mismatch";
                /* LCOV_EXCL_END */ 
            } else {
                // see for more details: https://github.com/mapnik/mapnik/wiki/Image-IO#webp-output-options
                config.quality = baton->quality;
                if (baton->compression > 0) {
                    config.method = baton->compression;
                }
                mapnik::save_as_webp(baton->stream,image,config,alpha);
            }
#else
            baton->message = "Mapnik not built with webp support";
#endif
        } else {
            // Save as PNG.
#if defined(HAVE_PNG)
            mapnik::png_options opts;
            opts.compression = baton->compression;
            if (baton->encoder == BLEND_ENCODER_MINIZ) opts.use_miniz = true;
            if (baton->palette && baton->palette->valid()) {
                mapnik::save_as_png8_pal(baton->stream, image, *baton->palette, opts);
            } else if (baton->quality > 0) {
                opts.colors = baton->quality;
                // Paletted PNG.
                if (alpha && baton->mode == BLEND_MODE_HEXTREE) {
                    mapnik::save_as_png8_hex(baton->stream, image, opts);
                } else {
                    mapnik::save_as_png8_oct(baton->stream, image, opts);
                }
            } else {
                mapnik::save_as_png(baton->stream, image, opts);
            }
#else
            baton->message = "Mapnik not built with png support";
#endif
        }
    } catch (const std::exception& ex) {
        baton->message = ex.what();
    }
}

void Work_Blend(uv_work_t* req) {
    BlendBaton* baton = static_cast<BlendBaton*>(req->data);

    int total = baton->images.size();
    bool alpha = true;
    int size = 0;

    // Iterate from the last to first image because we potentially don't have
    // to decode all images if there's an opaque one.
    Images::reverse_iterator rit = baton->images.rbegin();
    Images::reverse_iterator rend = baton->images.rend();
    for (int index = total - 1; rit != rend; rit++, index--) {
        // If an image that is higher than the current is opaque, stop alltogether.
        if (!alpha) break;

        BImage *image = &**rit;
        std::unique_ptr<mapnik::image_reader> image_reader;
        try {
            image_reader = std::unique_ptr<mapnik::image_reader>(mapnik::get_image_reader(image->data, image->dataLength));
        } catch (std::exception const& ex) {
            baton->message = ex.what();
            return;
        }

        if (!image_reader || !image_reader.get()) {
            // Not quite sure anymore how the pointer would not be returned
            // from the reader and can't find a way to make this fail.
            // So removing from coverage
            /* LCOV_EXCL_START */
            baton->message = "Unknown image format";
            return;
            /* LCOV_EXCL_END */
        }

        unsigned layer_width = image_reader->width();
        unsigned layer_height = image_reader->height();
        // Error out on invalid images.
        if (layer_width == 0 || layer_height == 0) {
            // No idea how to create a zero height or width image
            // so removing from coverage, because I am fairly certain
            // it is not possible in almost every image format.
            /* LCOV_EXCL_START */
            baton->message = "zero width/height image encountered";
            return;
            /* LCOV_EXCL_END */
        }

        int visibleWidth = (int)layer_width + image->x;
        int visibleHeight = (int)layer_height + image->y;
        // The first image that is in the viewport sets the width/height, if not user supplied.
        if (baton->width <= 0) baton->width = std::max(0, visibleWidth);
        if (baton->height <= 0) baton->height = std::max(0, visibleHeight);

        // Skip images that are outside of the viewport.
        if (visibleWidth <= 0 || visibleHeight <= 0 || image->x >= baton->width || image->y >= baton->height) {
            // Remove this layer from the list of layers we consider blending.
            continue;
        }

        bool layer_has_alpha = image_reader->has_alpha();

        // Short-circuit when we're not reencoding.
        if (size == 0 && !layer_has_alpha && !baton->reencode &&
            image->x == 0 && image->y == 0 &&
            (int)layer_width == baton->width && (int)layer_height == baton->height)
        {
            baton->stream.write((char *)image->data, image->dataLength);
            return;
        }

        // allocate image for decoded pixels
        std::unique_ptr<mapnik::image_rgba8> im_ptr(new mapnik::image_rgba8(layer_width,layer_height));
        // actually decode pixels now
        try {
            image_reader->read(0,0,*im_ptr);
        } catch (std::exception const&) {
            baton->message = "Could not decode image";
            return;
        }

        bool coversWidth = image->x <= 0 && visibleWidth >= baton->width;
        bool coversHeight = image->y <= 0 && visibleHeight >= baton->height;
        if (!layer_has_alpha && coversWidth && coversHeight && image->tint.is_alpha_identity()) {
            // Skip decoding more layers.
            alpha = false;
        }

        // Convenience aliases.
        image->width = layer_width;
        image->height = layer_height;
        image->im_ptr = std::move(im_ptr);
        size++;

    }

    // Now blend images.
    int pixels = baton->width * baton->height;
    if (pixels <= 0) {
        std::ostringstream msg;
        msg << "Image dimensions " << baton->width << "x" << baton->height << " are invalid";
        baton->message = msg.str();
        return;
    }

    mapnik::image_rgba8 target(baton->width, baton->height);
    // When we don't actually have transparent pixels, we don't need to set the matte.
    if (alpha) {
        target.set(baton->matte);
    }
    for (auto image_ptr : baton->images)
    {
        if (image_ptr && image_ptr->im_ptr.get())
        {
            Blend_Composite(target.data(), baton, &*image_ptr);
        }
    }
    Blend_Encode(target, baton, alpha);
}

void Work_AfterBlend(uv_work_t* req) {
    NanScope();
    BlendBaton* baton = static_cast<BlendBaton*>(req->data);

    if (!baton->message.length()) {
        std::string result = baton->stream.str();
        Local<Value> argv[] = {
            NanNull(),
            NanNewBufferHandle((char *)result.data(), result.length()),
        };
        NanMakeCallback(NanGetCurrentContext()->Global(), NanNew(baton->callback), 2, argv);
    } else {
        Local<Value> argv[] = {
            NanError(baton->message.c_str())
        };
        NanMakeCallback(NanGetCurrentContext()->Global(), NanNew(baton->callback), 1, argv);
    }
    delete baton;
}

NAN_METHOD(Blend) {
    NanScope();
    std::unique_ptr<BlendBaton> baton(new BlendBaton());

    Local<Object> options;
    if (args.Length() == 0 || !args[0]->IsArray()) {
        NanThrowTypeError("First argument must be an array of Buffers.");
        NanReturnUndefined();
    } else if (args.Length() == 1) {
        NanThrowTypeError("Second argument must be a function");
        NanReturnUndefined();
    } else if (args.Length() == 2) {
        // No options provided.
        if (!args[1]->IsFunction()) {
            NanThrowTypeError("Second argument must be a function.");
            NanReturnUndefined();
        }
        NanAssignPersistent(baton->callback,args[1].As<Function>());
    } else if (args.Length() >= 3) {
        if (!args[1]->IsObject()) {
            NanThrowTypeError("Second argument must be a an options object.");
            NanReturnUndefined();
        }
        options = Local<Object>::Cast(args[1]);

        if (!args[2]->IsFunction()) {
            NanThrowTypeError("Third argument must be a function.");
            NanReturnUndefined();
        }
        NanAssignPersistent(baton->callback,args[2].As<Function>());
    }

    // Validate options
    if (!options.IsEmpty()) {
        baton->quality = options->Get(NanNew("quality"))->Int32Value();

        Local<Value> format_val = options->Get(NanNew("format"));
        if (!format_val.IsEmpty() && format_val->IsString()) {
            if (strcmp(*String::Utf8Value(format_val), "jpeg") == 0 ||
                    strcmp(*String::Utf8Value(format_val), "jpg") == 0) {
                baton->format = BLEND_FORMAT_JPEG;
                if (baton->quality == 0) baton->quality = 85; // 85 is same default as mapnik core jpeg
                else if (baton->quality < 0 || baton->quality > 100) {
                    NanThrowTypeError("JPEG quality is range 0-100.");
                    NanReturnUndefined();
                }
            } else if (strcmp(*String::Utf8Value(format_val), "png") == 0) {
                if (baton->quality == 1 || baton->quality > 256) {
                    NanThrowTypeError("PNG images must be quantized between 2 and 256 colors.");
                    NanReturnUndefined();
                }
            } else if (strcmp(*String::Utf8Value(format_val), "webp") == 0) {
                baton->format = BLEND_FORMAT_WEBP;
                if (baton->quality == 0) baton->quality = 80;
                else if (baton->quality < 0 || baton->quality > 100) {
                    NanThrowTypeError("WebP quality is range 0-100.");
                    NanReturnUndefined();
                }
            } else {
                NanThrowTypeError("Invalid output format.");
                NanReturnUndefined();
            }
        }

        baton->reencode = options->Get(NanNew("reencode"))->BooleanValue();
        baton->width = options->Get(NanNew("width"))->Int32Value();
        baton->height = options->Get(NanNew("height"))->Int32Value();

        Local<Value> matte_val = options->Get(NanNew("matte"));
        if (!matte_val.IsEmpty() && matte_val->IsString()) {
            if (!hexToUInt32Color(*String::Utf8Value(matte_val->ToString()), baton->matte))
            {
                NanThrowTypeError("Invalid batte provided.");
                NanReturnUndefined();
            }

            // Make sure we're reencoding in the case of single alpha PNGs
            if (baton->matte && !baton->reencode) {
                baton->reencode = true;
            }
        }

        Local<Value> palette_val = options->Get(NanNew("palette"));
        if (!palette_val.IsEmpty() && palette_val->IsObject()) {
            baton->palette = node::ObjectWrap::Unwrap<Palette>(palette_val->ToObject())->palette();
        }

        Local<Value> mode_val = options->Get(NanNew("mode"));
        if (!mode_val.IsEmpty() && mode_val->IsString()) {
            if (strcmp(*String::Utf8Value(mode_val), "octree") == 0 ||
                strcmp(*String::Utf8Value(mode_val), "o") == 0) {
                baton->mode = BLEND_MODE_OCTREE;
            }
            else if (strcmp(*String::Utf8Value(mode_val), "hextree") == 0 ||
                strcmp(*String::Utf8Value(mode_val), "h") == 0) {
                baton->mode = BLEND_MODE_HEXTREE;
            }
        }

        Local<Value> encoder_val = options->Get(NanNew("encoder"));
        if (!encoder_val.IsEmpty() && encoder_val->IsString()) {
            if (strcmp(*String::Utf8Value(encoder_val), "miniz") == 0) {
                baton->encoder = BLEND_ENCODER_MINIZ;
            }
            // default is libpng
        }

        if (options->Has(NanNew("compression"))) {
            Local<Value> compression_val = options->Get(NanNew("compression"));
            if (!compression_val.IsEmpty() && compression_val->IsNumber())
            {
                baton->compression = compression_val->Int32Value();
            }
            else
            {
                NanThrowTypeError("Compression option must be a number");
                NanReturnUndefined();
            }
        }

        int min_compression = Z_NO_COMPRESSION;
        int max_compression = Z_BEST_COMPRESSION;
        if (baton->format == BLEND_FORMAT_PNG) {
            if (baton->compression < 0) baton->compression = Z_DEFAULT_COMPRESSION;
            if (baton->encoder == BLEND_ENCODER_MINIZ) max_compression = 10; // MZ_UBER_COMPRESSION
        } else if (baton->format == BLEND_FORMAT_WEBP) {
            min_compression = 0, max_compression = 6;
            if (baton->compression < 0) baton->compression = -1;
        }

        if (baton->compression > max_compression) {
            std::ostringstream msg;
            msg << "Compression level must be between "
                << min_compression << " and " << max_compression;
            NanThrowTypeError(msg.str().c_str());
            NanReturnUndefined();
        }
    }

    Local<Array> js_images = Local<Array>::Cast(args[0]);
    uint32_t length = js_images->Length();
    if (length < 1 && !baton->reencode) {
        NanThrowTypeError("First argument must contain at least one Buffer.");
        NanReturnUndefined();
    } else if (length == 1 && !baton->reencode) {
        Local<Value> buffer = js_images->Get(0);
        if (Buffer::HasInstance(buffer)) {
            // Directly pass through buffer if it's the only one.
            Local<Value> argv[] = {
                NanNull(),
                buffer
            };
            NanMakeCallback(NanGetCurrentContext()->Global(), NanNew(baton->callback), 2, argv);
            NanReturnUndefined();
        } else {
            // Check whether the argument is a complex image with offsets etc.
            // In that case, we don't throw but continue going through the blend
            // process below.
            bool valid = false;
            if (buffer->IsObject()) {
                Local<Object> props = buffer->ToObject();
                valid = props->Has(NanNew("buffer")) &&
                        Buffer::HasInstance(props->Get(NanNew("buffer")));
            }
            if (!valid) {
                NanThrowTypeError("All elements must be Buffers or objects with a 'buffer' property.");
                NanReturnUndefined();
            }
        }
    }

    if (!(length >= 1 || (baton->width > 0 && baton->height > 0))) {
        NanThrowTypeError("Without buffers, you have to specify width and height.");
        NanReturnUndefined();
    }

    if (baton->width < 0 || baton->height < 0) {
        NanThrowTypeError("Image dimensions must be greater than 0.");
        NanReturnUndefined();
    }

    for (uint32_t i = 0; i < length; i++) {
        ImagePtr image = std::make_shared<BImage>();
        Local<Value> buffer = js_images->Get(i);
        if (Buffer::HasInstance(buffer)) {
            NanAssignPersistent(image->buffer,buffer.As<Object>());
        } else if (buffer->IsObject()) {
            Local<Object> props = buffer->ToObject();
            if (props->Has(NanNew("buffer"))) {
                buffer = props->Get(NanNew("buffer"));
                if (Buffer::HasInstance(buffer)) {
                    NanAssignPersistent(image->buffer,buffer.As<Object>());
                }
            }
            image->x = props->Get(NanNew("x"))->Int32Value();
            image->y = props->Get(NanNew("y"))->Int32Value();

            Local<Value> tint_val = props->Get(NanNew("tint"));
            if (!tint_val.IsEmpty() && tint_val->IsObject()) {
                Local<Object> tint = tint_val->ToObject();
                if (!tint.IsEmpty()) {
                    baton->reencode = true;
                    std::string msg;
                    parseTintOps(tint,image->tint,msg);
                    if (!msg.empty()) {
                        NanThrowTypeError(msg.c_str());
                        NanReturnUndefined();
                    }
                }
            }
        }

        if (image->buffer.IsEmpty()) {
            NanThrowTypeError("All elements must be Buffers or objects with a 'buffer' property.");
            NanReturnUndefined();
        }

        image->data = node::Buffer::Data(buffer);
        image->dataLength = node::Buffer::Length(buffer);
        baton->images.push_back(image);
    }

    uv_queue_work(uv_default_loop(), &(baton.release())->request, Work_Blend, (uv_after_work_cb)Work_AfterBlend);

    NanReturnUndefined();
}

}
