// * duplicates
const checkDuplicate = async (res, Model, field, excludeId = null) => {
  const query = { ...field };
  if (excludeId) {
    query._id = { $ne: excludeId }; // * exclude the current document from the check
  }

  const isDuplicate = await Model.findOne(query);
  if (isDuplicate) {
    const keys = Object.keys(field);
    const fieldList = keys.join(", ");
    const message =
      keys.length === 1
        ? `${fieldList} already in use`
        : `Combination of ${fieldList} already in use`;

    res.status(409).json({
      success: false,
      message,
    });
    return true;
  }

  return false;
};

export { checkDuplicate };
