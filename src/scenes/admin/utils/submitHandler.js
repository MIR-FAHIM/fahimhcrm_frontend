import { toast } from "sonner";

const submitHandler = async (data, actionFn, resetForm) => {
  const toastId = toast.loading("Submitting data, please wait...");

  try {
    const res = await actionFn(data).unwrap();
    toast.success(res?.message || "Data submitted", {
      id: toastId,
      duration: 2000,
    });
    if (resetForm) {
      resetForm();
    }
    return res;
  } catch (error) {
    console.error("Error:", error);
    toast.error(error?.data?.errors || "An error occurred", {
      id: toastId,
      duration: 2000,
    });
    throw error;
  }
};

export default submitHandler;
