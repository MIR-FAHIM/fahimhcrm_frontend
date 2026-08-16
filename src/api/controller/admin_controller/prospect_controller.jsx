import API_URL from '../../api_url';
// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API

const getProspectToken = () => {
  const storedUser = localStorage.getItem("loggedInUser") || localStorage.getItem("user");
  try {
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    if (parsedUser?.app_token) return parsedUser.app_token;
  } catch (error) {
    // Fall back to legacy auth token below.
  }
  return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
};

const locationHeaders = () => ({ token: getProspectToken() });

const asLocationError = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const getProspectApiError = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat().filter(Boolean)[0];
    if (firstError) return firstError;
  }
  return data?.message || data?.error || error?.message || fallback;
};

export const fetchDivisions = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getDivision, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching divisions:", error);
    throw new Error(asLocationError(error, "Failed to fetch divisions."));
  }
};

export const fetchDistrictsByDivision = async (divisionId) => {
  try {
    const response = await axiosInstance.get(API_URL.getDistrictByDivisionId(divisionId), {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching districts:", error);
    throw new Error(asLocationError(error, "Failed to fetch districts."));
  }
};

export const fetchUpozelasByDistrict = async (districtId) => {
  try {
    const response = await axiosInstance.get(API_URL.getUpozelaByDistrictId(districtId), {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching upazilas:", error);
    throw new Error(asLocationError(error, "Failed to fetch upazilas."));
  }
};


export const getProspectAllStatus = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectStages,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}

export const getProspectViewPreference = async (userId) => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectViewPreference(userId), {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prospect view preference:", error);
    throw new Error(getProspectApiError(error, "Failed to fetch prospect view preference."));
  }
};

export const updateProspectViewPreference = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateProspectViewPreference, data, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating prospect view preference:", error);
    throw new Error(getProspectApiError(error, "Failed to update prospect view preference."));
  }
};

export const addProspectStage = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addProspectStage, data, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error adding prospect stage:", error);
    throw new Error(getProspectApiError(error, "Failed to add prospect stage."));
  }
};

export const updateProspectStage = async (id, data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateProspectStageById(id), data, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error updating prospect stage:", error);
    throw new Error(getProspectApiError(error, "Failed to update prospect stage."));
  }
};

export const updateProspectStageOrder = async (stages) => {
  try {
    const response = await axiosInstance.post(
      API_URL.updateProspectStageOrder,
      { stages },
      { headers: locationHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating prospect stage order:", error);
    throw new Error(getProspectApiError(error, "Failed to update prospect stage order."));
  }
};

export const getProspectStagesByLog = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.prospectstageByLogAndProspect,data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const deleteProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.deleteProspectById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching delete :", error);
    return [];
  }
}
export const updateProspect = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.updateProspect,data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updateProspect updateProspect:", error);
    return [];
  }
}
export const fetchMonthlyProspectController = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectMonthReport,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const fetchWeeklyProspectController = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectWeeklyReport,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const sourceWiseProspectController = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectSourceWise,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching sourceWiseProspectController:", error);
    return [];
  }
}
export const fetchMeetingByProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getMeetingByProspectById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchMeetingByProspect:", error);
    return [];
  }
}
export const getAllProspectStageOverview = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectStageOverview,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const getAllLogActivityOfProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getLogActivityByProspectById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllLogActivityOfProspect:", error);
    return [];
  }
}
export const getEffortCalculation = async () => {
  try {
    const response = await axiosInstance.get(API_URL.calculateEffortProspect,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getAllLogActivityOfProspect:", error);
    return [];
  }
}
export const getProspectIndustryType = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getIndustryType,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const getProspectSource = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getInformationSource,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fetchDepartment:", error);
    return [];
  }
}
export const fetchAllProspect = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getAllProspect,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}
export const fetchAllWarehouse = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getWarehouse,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-warehouse:", error);
    return [];
  }
}
export const fetchAllProspectByStage = async () => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectByStage,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}

export const getProspectDetails = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getProspectDetailById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}
export const getContactPersonProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.getContactPersonProspectById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching get-all-prospect:", error);
    return [];
  }
}
export const getAssignedPersonsProspect = async (id) => {
  try {
    const response = await axiosInstance.get(API_URL.prospectConcernPersonById(id),
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching getAssignedPersonsProspect:", error);
    return [];
  }
}
export const addProspect = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.createProspect, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const removeAssignPerson = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.prospectConcernPersonRemove, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add removeAssignPerson data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addConcernPersonsMultiple = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.prospectConcernPersonAdd, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const checkProspectAvaiblity = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.checkProspectnameAvaiblity, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add checkProspectAvaiblity data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

export const convertToPrsspect = async (ids) => {
  try {
    const response = await axiosInstance.post(API_URL.convertToProspect, {
      ids // ✅ wrapping in `data` key like your curl
    },
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const convertContactRowStatusMultiple = async (idList) => {
  try {
    const response = await axiosInstance.post(API_URL.updateContactStatus,
       idList, // ✅ wrapping in `data` key like your curl,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const convertContactRowStatusMultipleForFacebook = async (idList) => {
  try {
    const response = await axiosInstance.post(API_URL.updateContactStatusFacebook,
       idList, // ✅ wrapping in `data` key like your curl,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addContactPerson = async (data) => {
  try {
    const formData = new FormData();

    formData.append('prospect_id', data.prospect_id);

    data.contacts.forEach((contact, index) => {
      formData.append(`contacts[${index}][person_name]`, contact.person_name);
      formData.append(`contacts[${index}][mobile]`, contact.mobile);
      formData.append(`contacts[${index}][email]`, contact.email);
      formData.append(`contacts[${index}][designation_id]`, contact.designation_id);
      formData.append(`contacts[${index}][is_primary]`, contact.is_primary);
      formData.append(`contacts[${index}][is_responsive]`, contact.is_responsive);
      formData.append(`contacts[${index}][attitude_id]`, contact.attitude_id);
      formData.append(`contacts[${index}][is_key_contact]`, contact.is_key_contact);
      formData.append(`contacts[${index}][influencing_role_id]`, contact.influencing_role_id);
      formData.append(`contacts[${index}][birth_date]`, contact.birth_date);
      formData.append(`contacts[${index}][anniversary]`, contact.anniversary);
      const isSwitchedJob = contact.is_switched_job === true || contact.is_switched_job === 1 || contact.is_switched_job === "1" ? 1 : 0;
      formData.append(`contacts[${index}][is_switched_job]`, isSwitchedJob);
      formData.append(`contacts[${index}][note]`, contact.note);
    });

    const response = await axiosInstance.post(API_URL.addProspectContactPerson,
      formData,
      {
        headers: {
          'token': localStorage.getItem("authToken"),
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error in addContactPerson:", error.response?.data || error);
    throw error;
  }
};
export const addLogActivityProspect = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addProspectLogActivity, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response.data; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const changeProspectStatus = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.changeProspectStage, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addMeeting = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addMeeting, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}
export const addContactUs = async (data) => {
  try {
    const response = await axiosInstance.post(API_URL.addContactUs, data,
      {
        headers: {
          'token': localStorage.getItem("authToken"), // Add the token in Authorization header
        },
      }
    );
    return response; // Return the response from the API
  } catch (error) {
    console.error("Error add addProspect data:", error);
    throw error; // Rethrow the error for further handling in your component
  }

}

const bulkImportError = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors).flat().filter(Boolean)[0];
    if (firstError) return firstError;
  }
  return data?.message || data?.error || error?.message || fallback;
};

export const downloadProspectBulkTemplate = async () => {
  try {
    const response = await axiosInstance.get(API_URL.prospectBulkTemplate, {
      headers: locationHeaders(),
      responseType: "blob",
    });
    const disposition = response.headers?.["content-disposition"] || "";
    const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
    return {
      blob: response.data,
      fileName: fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : "prospect_bulk_import_template.csv",
    };
  } catch (error) {
    console.error("Error downloading prospect bulk template:", error);
    throw new Error(bulkImportError(error, "Failed to download prospect template."));
  }
};

export const previewProspectBulkImport = async (file, uploadedBy) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (uploadedBy) formData.append("uploaded_by", uploadedBy);

    const response = await axiosInstance.post(API_URL.prospectBulkPreview, formData, {
      headers: {
        ...locationHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error previewing prospect bulk import:", error);
    throw new Error(bulkImportError(error, "Failed to preview prospect import."));
  }
};

export const confirmProspectBulkImport = async (importId) => {
  try {
    const response = await axiosInstance.post(
      API_URL.prospectBulkConfirm,
      { import_id: importId },
      { headers: locationHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error("Error confirming prospect bulk import:", error);
    throw new Error(bulkImportError(error, "Failed to confirm prospect import."));
  }
};

export const getProspectBulkHistory = async () => {
  try {
    const response = await axiosInstance.get(API_URL.prospectBulkHistory, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prospect bulk import history:", error);
    throw new Error(bulkImportError(error, "Failed to fetch prospect import history."));
  }
};

export const getProspectBulkDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`${API_URL.prospectBulkDetails}${id}`, {
      headers: locationHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching prospect bulk import details:", error);
    throw new Error(bulkImportError(error, "Failed to fetch prospect import details."));
  }
};
