import { useGetWarehouseTypesQuery } from "../../redux/features/warehouse";
import FormikDropdown from "./FormikDropdown";

const WarehouseTypes = ({ name }) => {
  const { data, isLoading } = useGetWarehouseTypesQuery();
  if (isLoading) return <div>Loading...</div>;
  const warehouseOptions = data?.data?.map((item) => ({
    label: item?.type_name,
    value: String(item?.id),
  }));
  return (
    <FormikDropdown
      name={name ? name : "warehouseType_id"}
      options={warehouseOptions}
      label="Select Warehouse Type"
    />
  );
};

export default WarehouseTypes;
