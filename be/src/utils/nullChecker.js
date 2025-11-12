const nullChecker = (res, requiredFields) => {
  const missingFields = Object.entries(requiredFields).filter(
    ([key, value]) => value === undefined || value === null || value === ""
  );
  if (missingFields.length > 0) {
    res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields
        .map(([key]) => key)
        .join(", ")}`,
    });
    return true;
  }
  return false;
};

export { nullChecker };
