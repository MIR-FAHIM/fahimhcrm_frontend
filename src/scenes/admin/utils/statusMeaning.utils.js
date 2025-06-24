const statusMeaning = (category, statusCode) => {
  const statuses = {
    Order_Request: {
      0: "Pending",
      1: "Contacted",
      2: "Pending_Payment",
      3: "Advance_Paid",
      4: "Place_Order",
    },
    Warehouse: {
      0: "Active",
      1: "Inactive",
    },
    payment: {
      0: "Pending",
      1: "Paid",
    },
    order: {
      0: "Waiting",
      1: "Ongoing",
      2: "Ready to ship",
    },
    LongTerm: {
      0: "Regular",
      1: "Long Term",
    },
    deliver: {
      0: "Waiting",
      1: "Delivered",
      2: "Ready to ship",
    },
    Grid: {
      0: "Available",
      1: "Occupied",
    },
  };
  if (statuses[category]) {
    return statuses[category][statusCode] || "Invalid status code";
  } else {
    return "Invalid category";
  }
};

export default statusMeaning;
