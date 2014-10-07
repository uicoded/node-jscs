var assert = require('assert');

var BUILTIN_OPTIONS = {
    plugins: true,
    preset: true,
    excludeFiles: true,
    additionalRules: true,
    fileExtensions: true
};

/**
 * JSCS Configuration.
 * Browser/Rhino-compatible.
 *
 * @name Configuration
 */
function Configuration() {
    this._presets = {};
    this._rules = {};
    this._configuredRules = [];
    this._fileExtensions = ['.js'];
    this._excludedFiles = [];
}

/**
 * Load settings from a configuration.
 *
 * @param {Object} config
 */
Configuration.prototype.load = function(config) {
    var ruleSettings = this._processConfig(config);
    var unsupportedRules = [];
    this._configuredRules = Object.keys(ruleSettings).forEach(function(optionName) {
        var rule = this._rules[optionName];
        if (rule) {
            rule.configure(ruleSettings[optionName]);
        } else {
            unsupportedRules.push(optionName);
        }
    }, this);
    if (unsupportedRules.length > 0) {
        throw new Error('Unsupported rules: ' + unsupportedRules.join(', '));
    }
};

/**
 * Returns list of configured rules.
 *
 * @returns {Rule[]}
 */
Configuration.prototype.getConfiguredRules = function() {
    return this._configuredRules;
};

/**
 * Returns excluded file mask list.
 *
 * @returns {String[]}
 */
Configuration.prototype.getExcludedFiles = function() {
    return this._excludedFiles;
};

/**
 * Returns file extension list.
 *
 * @returns {String[]}
 */
Configuration.prototype.getFileExtensions = function() {
    return this._fileExtensions;
};

/**
 * Processes configuration and returns config options.
 *
 * @param {Object} config
 * @returns {Object}
 */
Configuration.prototype._processConfig = function(config) {
    var ruleSettings = {};

    // Load plugins
    if (config.plugins) {
        assert(Array.isArray(config.plugins), 'plugins option requires array value');
        config.plugins.forEach(this._loadPlugin, this);
    }

    // Apply presets
    if (config.preset) {
        var presetName = config.preset;
        assert(typeof presetName === 'string', 'preset option requires string value');
        var presetData = this._presets[presetName];
        assert(Boolean(presetData), 'preset "' + presetName + '" was not found');
        var presetResult = this.process(presetData);
        Object.keys(presetResult).forEach(function(key) {
            if (!BUILTIN_OPTIONS[key]) {
                ruleSettings[key] = presetResult[key];
            }
        });
    }

    // File extensions
    if (config.fileExtensions) {
        assert(
            typeof config.fileExtensions === 'string' || Array.isArray(config.fileExtensions),
            'fileExtensions option requires string or array value'
        );
        this._fileExtensions = [].concat(config.fileExtensions);
    }

    // File excludes
    if (config.excludeFiles) {
        assert(Array.isArray(config.excludeFiles), 'excludeFiles option requires array value');
        this._excludedFiles = config.excludeFiles;
    }

    // Additional rules
    if (config.additionalRules) {
        assert(Array.isArray(config.additionalRules), 'additionalRules option requires array value');
        config.additionalRules.plugins.forEach(this._loadAdditionalRule, this);

    }

    // Apply config options
    Object.keys(config).forEach(function(key) {
        if (!BUILTIN_OPTIONS[key]) {
            ruleSettings[key] = config[key];
        }
    });

    return ruleSettings;
};

/**
 * Loads plugin data.
 *
 * @param {function(Configuration)} plugin
 * @protected
 */
Configuration.prototype._loadPlugin = function(plugin) {
    assert(typeof plugin === 'function', 'plugin should be a function');
    plugin(this);
};

/**
 * Loads additional rule.
 *
 * @param {Rule} additionalRule
 * @protected
 */
Configuration.prototype._loadAdditionalRule = function(additionalRule) {
    assert(typeof additionalRule === 'object', 'additionalRule should be an object');
    this.registerRule(additionalRule);
};

/**
 * Adds rule to the collection.
 *
 * @param {Rule} rule
 */
Configuration.prototype.registerRule = function(rule) {
    this._rules[rule.getOptionName()] = rule;
};

/**
 * Adds preset to the collection.
 *
 * @param {String} presetName
 * @param {Object} presetConfig
 */
Configuration.prototype.registerPreset = function(presetName, presetConfig) {
    this._presets[presetName] = presetConfig;
};

/**
 * Registers built-in Code Style cheking rules.
 */
Configuration.prototype.registerDefaultRules = function() {
    this.registerRule(new (require('./../rules/require-curly-braces'))());
    this.registerRule(new (require('./../rules/require-multiple-var-decl'))());
    this.registerRule(new (require('./../rules/disallow-multiple-var-decl'))());
    this.registerRule(new (require('./../rules/disallow-empty-blocks'))());
    this.registerRule(new (require('./../rules/require-space-after-keywords'))());
    this.registerRule(new (require('./../rules/disallow-space-after-keywords'))());
    this.registerRule(new (require('./../rules/require-parentheses-around-iife'))());

    /* deprecated rules */
    this.registerRule(new (require('./../rules/require-left-sticked-operators'))());
    this.registerRule(new (require('./../rules/disallow-left-sticked-operators'))());
    this.registerRule(new (require('./../rules/require-right-sticked-operators'))());
    this.registerRule(new (require('./../rules/disallow-right-sticked-operators'))());
    this.registerRule(new (require('./../rules/validate-jsdoc'))());
    /* deprecated rules (end) */

    this.registerRule(new (require('./../rules/require-operator-before-line-break'))());
    this.registerRule(new (require('./../rules/disallow-implicit-type-conversion'))());
    this.registerRule(new (require('./../rules/require-camelcase-or-uppercase-identifiers'))());
    this.registerRule(new (require('./../rules/disallow-keywords'))());
    this.registerRule(new (require('./../rules/disallow-multiple-line-breaks'))());
    this.registerRule(new (require('./../rules/disallow-multiple-line-strings'))());
    this.registerRule(new (require('./../rules/validate-line-breaks'))());
    this.registerRule(new (require('./../rules/validate-quote-marks'))());
    this.registerRule(new (require('./../rules/validate-indentation'))());
    this.registerRule(new (require('./../rules/disallow-trailing-whitespace'))());
    this.registerRule(new (require('./../rules/disallow-mixed-spaces-and-tabs'))());
    this.registerRule(new (require('./../rules/require-keywords-on-new-line'))());
    this.registerRule(new (require('./../rules/disallow-keywords-on-new-line'))());
    this.registerRule(new (require('./../rules/require-line-feed-at-file-end'))());
    this.registerRule(new (require('./../rules/maximum-line-length'))());
    this.registerRule(new (require('./../rules/require-yoda-conditions'))());
    this.registerRule(new (require('./../rules/disallow-yoda-conditions'))());
    this.registerRule(new (require('./../rules/require-spaces-inside-object-brackets'))());
    this.registerRule(new (require('./../rules/require-spaces-inside-array-brackets'))());
    this.registerRule(new (require('./../rules/require-spaces-inside-parentheses'))());
    this.registerRule(new (require('./../rules/disallow-spaces-inside-object-brackets'))());
    this.registerRule(new (require('./../rules/disallow-spaces-inside-array-brackets'))());
    this.registerRule(new (require('./../rules/disallow-spaces-inside-parentheses'))());
    this.registerRule(new (require('./../rules/require-blocks-on-newline'))());
    this.registerRule(new (require('./../rules/require-space-after-object-keys'))());
    this.registerRule(new (require('./../rules/require-space-before-object-values'))());
    this.registerRule(new (require('./../rules/disallow-space-after-object-keys'))());
    this.registerRule(new (require('./../rules/disallow-space-before-object-values'))());
    this.registerRule(new (require('./../rules/disallow-quoted-keys-in-objects'))());
    this.registerRule(new (require('./../rules/disallow-dangling-underscores'))());
    this.registerRule(new (require('./../rules/require-aligned-object-values'))());

    this.registerRule(new (require('./../rules/disallow-padding-newlines-in-blocks'))());
    this.registerRule(new (require('./../rules/require-padding-newlines-in-blocks'))());
    this.registerRule(new (require('./../rules/require-newline-before-block-statements'))());
    this.registerRule(new (require('./../rules/disallow-newline-before-block-statements'))());

    this.registerRule(new (require('./../rules/disallow-trailing-comma'))());
    this.registerRule(new (require('./../rules/require-trailing-comma'))());

    this.registerRule(new (require('./../rules/disallow-comma-before-line-break'))());
    this.registerRule(new (require('./../rules/require-comma-before-line-break'))());

    this.registerRule(new (require('./../rules/disallow-space-before-block-statements'))());
    this.registerRule(new (require('./../rules/require-space-before-block-statements'))());

    this.registerRule(new (require('./../rules/disallow-space-before-postfix-unary-operators'))());
    this.registerRule(new (require('./../rules/require-space-before-postfix-unary-operators'))());

    this.registerRule(new (require('./../rules/disallow-space-after-prefix-unary-operators'))());
    this.registerRule(new (require('./../rules/require-space-after-prefix-unary-operators'))());

    this.registerRule(new (require('./../rules/disallow-space-before-binary-operators'))());
    this.registerRule(new (require('./../rules/require-space-before-binary-operators'))());

    this.registerRule(new (require('./../rules/disallow-space-after-binary-operators'))());
    this.registerRule(new (require('./../rules/require-space-after-binary-operators'))());

    this.registerRule(new (require('./../rules/require-spaces-in-conditional-expression'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-conditional-expression'))());

    this.registerRule(new (require('./../rules/require-spaces-in-function'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-function'))());
    this.registerRule(new (require('./../rules/require-spaces-in-function-expression'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-function-expression'))());
    this.registerRule(new (require('./../rules/require-spaces-in-anonymous-function-expression'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-anonymous-function-expression'))());
    this.registerRule(new (require('./../rules/require-spaces-in-named-function-expression'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-named-function-expression'))());
    this.registerRule(new (require('./../rules/require-spaces-in-function-declaration'))());
    this.registerRule(new (require('./../rules/disallow-spaces-in-function-declaration'))());

    this.registerRule(new (require('./../rules/validate-parameter-separator'))());

    this.registerRule(new (require('./../rules/require-capitalized-constructors'))());

    this.registerRule(new (require('./../rules/safe-context-keyword'))());

    this.registerRule(new (require('./../rules/require-dot-notation'))());

    this.registerRule(new (require('./../rules/require-space-after-line-comment'))());
    this.registerRule(new (require('./../rules/disallow-space-after-line-comment'))());

    this.registerRule(new (require('./../rules/require-anonymous-functions'))());
    this.registerRule(new (require('./../rules/disallow-anonymous-functions'))());

    this.registerRule(new (require('./../rules/require-function-declarations'))());
    this.registerRule(new (require('./../rules/disallow-function-declarations'))());
};

/**
 * Registers built-in Code Style cheking presets.
 */
Configuration.prototype.registerDefaultPresets = function() {
    // https://github.com/airbnb/javascript
    this.registerPreset('airbnb', require('../../presets/airbnb.json'));

    // http://javascript.crockford.com/code.html
    this.registerPreset('crockford', require('../../presets/crockford.json'));

    // https://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    this.registerPreset('google', require('../../presets/google.json'));

    // https://contribute.jquery.org/style-guide/js/
    this.registerPreset('jquery', require('../../presets/jquery.json'));

    // https://github.com/mrdoob/three.js/wiki/Mr.doob's-Code-Style%E2%84%A2
    this.registerPreset('mdcs', require('../../presets/mdcs.json'));

    // https://www.mediawiki.org/wiki/Manual:Coding_conventions/JavaScript
    this.registerPreset('wikimedia', require('../../presets/wikimedia.json'));

    // https://github.com/ymaps/codestyle/blob/master/js.md
    this.registerPreset('yandex', require('../../presets/yandex.json'));
};

module.exports = Configuration;
