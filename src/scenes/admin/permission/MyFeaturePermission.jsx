import FeaturePermissionBoard from "./FeaturePermissionBoard";

const MyFeaturePermission = () => {
  const userID = localStorage.getItem("userId");

  return (
    <FeaturePermissionBoard
      userId={userID}
      title="My Permissions"
      subtitle="Review and update feature access for your own account."
      emptySelectionMessage="Your user session was not found. Please log in again."
    />
  );
};

export default MyFeaturePermission;
