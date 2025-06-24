export const transformArrayOfStringsIntoLabelAndValueArray = (types) => {
  return types.map((item) => ({
    label: item.toUpperCase(),
    value: item,
  }));
};

export const formatOptionsFormArrayOfObjects = (arr = [], label = "name") =>
  arr.map((item) => ({
    label: item?.[label],
    value: item?.id,
  }));
