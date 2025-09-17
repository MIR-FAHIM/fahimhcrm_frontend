// src/api/apiController.js
import axiosInstance from '../../axiosInstance.jsx'

// Fetch posts from API


export const getProspectAllStatus = async () => {
  try {
    const response = await axiosInstance.get(`/api/get-prospect-stages`,
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
export const getProspectStagesByLog = async (data) => {
  try {
    const response = await axiosInstance.post(`/api/prospectstage-by-log-and-prospect`,data,
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
    const response = await axiosInstance.get(`/api/delete-prospect/${id}`,
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
    const response = await axiosInstance.post(`/api/update-prospect`,data,
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
    const response = await axiosInstance.get(`/api/get-prospect-month-report`,
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
    const response = await axiosInstance.get(`/api/get-prospect-weekly-report`,
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
    const response = await axiosInstance.get(`/api/get-prospect-source-wise`,
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
    const response = await axiosInstance.get(`/api/get-meeting-by-prospect/${id}`,
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
    const response = await axiosInstance.get(`/api/get-prospect-stage-overview`,
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
    const response = await axiosInstance.get(`/api/get-log-activity-by-prospect/${id}`,
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
    const response = await axiosInstance.get(`/api/calculate-effort-prospect`,
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
    const response = await axiosInstance.get(`/api/get-industry-type`,
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
    const response = await axiosInstance.get(`/api/get-information-source`,
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
    const response = await axiosInstance.get(`/api/get-all-prospect`,
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
    const response = await axiosInstance.get(`/api/get-warehouse`,
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
    const response = await axiosInstance.get(`/api/get-prospect-by-stage`,
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
    const response = await axiosInstance.get(`/api/get-prospect-detail/${id}`,
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
    const response = await axiosInstance.get(`/api/get-contact-person-prospect/${id}`,
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
    const response = await axiosInstance.get(`/api/prospect-concern-person/${id}`,
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
    const response = await axiosInstance.post(`/api/create-prospect`, data,
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
    const response = await axiosInstance.post(`/api/prospect-concern-person/remove`, data,
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
    const response = await axiosInstance.post(`/api/prospect-concern-person/add`, data,
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
    const response = await axiosInstance.post(`/api/check-prospectname-avaiblity`, data,
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

export const convertToPrsspect = async (prospectList) => {
  try {
    const response = await axiosInstance.post(`/api/convert-to-prospect`, {
      data: prospectList // ✅ wrapping in `data` key like your curl
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
    const response = await axiosInstance.post(`/api/update-contact-status`, 
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
    const response = await axiosInstance.post(`/api/update-contact-status-facebook`, 
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
      formData.append(`contacts[${index}][is_switched_job]`, contact.is_switched_job);
      formData.append(`contacts[${index}][note]`, contact.note);
    });

    const response = await axiosInstance.post(`/api/add-prospect-contact-person`,
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
    const response = await axiosInstance.post(`/api/add-prospect-log-activity`, data,
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
    const response = await axiosInstance.post(`/api/change-prospect-stage`, data,
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
    const response = await axiosInstance.post(`/api/add-meeting`, data,
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
    const response = await axiosInstance.post(`/api/add-contact-us`, data,
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



