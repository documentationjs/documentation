/**
 * Global spectra deconvolution
 * @param {Array<Number>} x - Independent variable
 * @param {Array<Number>} yIn - Dependent variable
 * @param {Object} [options] - Options object
 * @param {Object} [options.sgOptions] - Options object for Savitzky-Golay filter. See https://github.com/mljs/savitzky-golay-generalized#options
 * @param {Number} [options.minMaxRatio = 0.00025] - Threshold to determine if a given peak should be considered as a noise
 * @param {Number} [options.broadRatio = 0.00] - If `broadRatio` is higher than 0, then all the peaks which second derivative
 * smaller than `broadRatio * maxAbsSecondDerivative` will be marked with the soft mask equal to true.
 * @param {Number} [options.noiseLevel = 3] - Noise threshold in spectrum units
 * @param {Boolean} [options.maxCriteria = true] - Peaks are local maximum(true) or minimum(false)
 * @param {Boolean} [options.smoothY = true] - Select the peak intensities from a smoothed version of the independent variables
 * @param {Boolean} [options.realTopDetection = false] - Use a quadratic optimizations with the peak and its 3 closest neighbors
 * to determine the true x,y values of the peak?
 * @param {Number} [options.heightFactor = 0] - Factor to multiply the calculated height (usually 2)
 * @param {Boolean} [options.boundaries = false] - Return also the inflection points of the peaks
 * @param {Number} [options.derivativeThreshold = 0] - Filters based on the amplitude of the first derivative
 * @return {Array<Object>}
 */
function gsd(x, yIn, options) {
}

module.exports = gsd;
