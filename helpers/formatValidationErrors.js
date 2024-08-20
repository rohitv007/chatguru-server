function formatValidationErrors(errors) {
  return Object.keys(errors).reduce((formattedErrors, key) => {
    formattedErrors[key] = errors[key].message;
    return formattedErrors;
  }, {});
}

module.exports = { formatValidationErrors };
