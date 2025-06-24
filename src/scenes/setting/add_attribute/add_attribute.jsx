import React, { useState, useEffect } from 'react';
import { addAttribute, getAttributes, addAttributeValue, getAttributesValues } from '../../../api/controller/setting_controller';

const AddAttribute = () => {
  const [attributeName, setAttributeName] = useState('');
  const [isActive, setIsActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [attributes, setAttributes] = useState([]); // To store fetched attributes
  const [selectedAttributeID, setSelectedAttributeID] = useState(null); // To store selected attribute ID
  const [attributeValue, setAttributeValue] = useState(''); // For new value input
  const [attributeValues, setAttributeValues] = useState([]); // To store values of the selected attribute

  // Fetch attributes when the component mounts
  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await getAttributes(); // Assuming getAttributes() fetches the attributes
        setAttributes(response.data); // Assuming the response contains the attributes list
      } catch (err) {
        console.error('Failed to fetch attributes', err);
        setError('Error fetching attributes');
      }
    };

    fetchAttributes();
  }, []);

  // Fetch values of selected attribute
  useEffect(() => {
    if (selectedAttributeID) {
      const fetchValues = async () => {
        try {
          const response = await getAttributesValues(selectedAttributeID);
          setAttributeValues(response.data); // Assuming the response contains values for the attribute
        } catch (err) {
          console.error('Failed to fetch values', err);
          setError('Error fetching values');
        }
      };

      fetchValues();
    }
  }, [selectedAttributeID]);

  const handleAttributeNameChange = (event) => {
    setAttributeName(event.target.value);
  };

  const handleIsActiveChange = (event) => {
    setIsActive(event.target.checked ? 1 : 0); // Change based on checkbox
  };

  const handleAttributeValueChange = (event) => {
    setAttributeValue(event.target.value);
  };

  const handleSubmitAttribute = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the addAttribute function from the controller
      const response = await addAttribute({
        "attribute_name":attributeName, 
        "isActive":isActive});

      if (response.status === 200) {
        setSuccess(true);
        setAttributeName('');
        setIsActive(0);
        // Fetch the updated list of attributes
        const updatedAttributes = await getAttributes();
        setAttributes(updatedAttributes.data); // Assuming the response contains updated data
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitValue = async (event) => {
    event.preventDefault();
    if (!selectedAttributeID || !attributeValue) return;

    try {
      const response = await addAttributeValue({
        "attribute_value":attributeValue,
         "attribute_id":selectedAttributeID,
        "isActive":1});

      if (response.status === 200) {
        setAttributeValue(''); // Clear input
        // Fetch the updated values for the selected attribute
        const updatedValues = await getValuesByAttributeID(selectedAttributeID);
        setAttributeValues(updatedValues.data); // Assuming response contains updated values
      }
    } catch (err) {
      setError('An error occurred while adding value. Please try again.');
      console.error(err);
    }
  };

  return (
    <div>
      <h1>Add Attribute</h1>
      {success && <p className="success">Attribute added successfully!</p>}
      {error && <p className="error">{error}</p>}

      {/* Form to add attribute */}
      <form onSubmit={handleSubmitAttribute}>
        <div>
          <label htmlFor="attributeName">Attribute Name</label>
          <input
            type="text"
            id="attributeName"
            name="attribute_name"
            value={attributeName}
            onChange={handleAttributeNameChange}
            required
          />
        </div>

        <div>
          <label htmlFor="isActive">Active</label>
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={isActive === 1}
            onChange={handleIsActiveChange}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Attribute'}
        </button>
      </form>

      {/* Table to display all attributes */}
      <h2>All Attributes</h2>
      <table>
        <thead>
          <tr>
            <th>Attribute Name</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {attributes.length === 0 ? (
            <tr>
              <td colSpan="3">No attributes found.</td>
            </tr>
          ) : (
            attributes.map((attribute) => (
              <tr key={attribute.id}> {/* Assuming each attribute has a unique "id" */}
                <td>{attribute.attribute_name}</td>
                <td>{attribute.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  <button onClick={() => setSelectedAttributeID(attribute.id)}>
                    Add Values
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Form to add value to the selected attribute */}
      {selectedAttributeID && (
        <div>
          <h3>Add Value to Selected Attribute</h3>
          <form onSubmit={handleSubmitValue}>
            <div>
              <label htmlFor="attributeValue">Attribute Value</label>
              <input
                type="text"
                id="attributeValue"
                value={attributeValue}
                onChange={handleAttributeValueChange}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Adding Value...' : 'Add Value'}
            </button>
          </form>

          {/* Display values for the selected attribute */}
          <h4>Values for Attribute {selectedAttributeID}</h4>
          <ul>
            {attributeValues.length === 0 ? (
              <li>No values found for this attribute.</li>
            ) : (
              attributeValues.map((value) => (
                <li key={value.id}>{value.attribute_value}</li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AddAttribute;
