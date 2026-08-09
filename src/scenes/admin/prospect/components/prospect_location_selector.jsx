import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  CircularProgress,
  Grid,
  TextField,
} from "@mui/material";
import {
  fetchDistrictsByDivision,
  fetchDivisions,
  fetchUpozelasByDistrict,
} from "../../../../api/controller/admin_controller/prospect_controller";

const asList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  return [];
};

const idValue = (value) => (value === null || value === undefined ? "" : String(value));

const findById = (items, id) => items.find((item) => idValue(item.id) === idValue(id)) || null;

const locationName = (option) =>
  option?.name ||
  option?.division_name ||
  option?.district_name ||
  option?.upazila_name ||
  option?.upozela_name ||
  option?.thana_name ||
  "";

const ProspectLocationSelector = ({
  form,
  setForm,
  inputSx,
  onError = () => {},
}) => {
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [loading, setLoading] = useState({
    divisions: false,
    districts: false,
    upazilas: false,
  });

  const selectedDivision = useMemo(
    () => findById(divisions, form.division_id),
    [divisions, form.division_id]
  );
  const selectedDistrict = useMemo(
    () => findById(districts, form.district_id),
    [districts, form.district_id]
  );
  const selectedUpazila = useMemo(
    () => findById(upazilas, form.thana_id),
    [upazilas, form.thana_id]
  );

  useEffect(() => {
    let mounted = true;
    setLoading((current) => ({ ...current, divisions: true }));

    fetchDivisions()
      .then((response) => {
        if (mounted) setDivisions(asList(response));
      })
      .catch((error) => {
        if (mounted) onError(error.message || "Failed to fetch divisions.");
      })
      .finally(() => {
        if (mounted) setLoading((current) => ({ ...current, divisions: false }));
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleDivisionChange = (_, division) => {
    const divisionId = division?.id || "";
    setDistricts([]);
    setUpazilas([]);
    setForm((current) => ({
      ...current,
      division_id: divisionId,
      district_id: "",
      thana_id: "",
    }));

    if (!divisionId) return;

    setLoading((current) => ({ ...current, districts: true }));
    fetchDistrictsByDivision(divisionId)
      .then((response) => setDistricts(asList(response)))
      .catch((error) => onError(error.message || "Failed to fetch districts."))
      .finally(() => setLoading((current) => ({ ...current, districts: false })));
  };

  const handleDistrictChange = (_, district) => {
    const districtId = district?.id || "";
    setUpazilas([]);
    setForm((current) => ({
      ...current,
      district_id: districtId,
      thana_id: "",
    }));

    if (!districtId) return;

    setLoading((current) => ({ ...current, upazilas: true }));
    fetchUpozelasByDistrict(districtId)
      .then((response) => setUpazilas(asList(response)))
      .catch((error) => onError(error.message || "Failed to fetch upazilas."))
      .finally(() => setLoading((current) => ({ ...current, upazilas: false })));
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Autocomplete
          options={divisions}
          value={selectedDivision}
          loading={loading.divisions}
          onChange={handleDivisionChange}
          getOptionLabel={locationName}
          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Division"
              placeholder="Search division"
              sx={inputSx}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading.divisions ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Autocomplete
          options={districts}
          value={selectedDistrict}
          loading={loading.districts}
          disabled={!form.division_id || loading.districts}
          onChange={handleDistrictChange}
          getOptionLabel={locationName}
          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="District"
              placeholder={form.division_id ? "Search district" : "Select division first"}
              sx={inputSx}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading.districts ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={4}>
        <Autocomplete
          options={upazilas}
          value={selectedUpazila}
          loading={loading.upazilas}
          disabled={!form.district_id || loading.upazilas}
          onChange={(_, upazila) =>
            setForm((current) => ({ ...current, thana_id: upazila?.id || "" }))
          }
          getOptionLabel={locationName}
          isOptionEqualToValue={(option, value) => idValue(option.id) === idValue(value.id)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Upazila / Thana"
              placeholder={form.district_id ? "Search upazila or thana" : "Select district first"}
              sx={inputSx}
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loading.upazilas ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
      </Grid>

      {!form.division_id && (
        <Grid item xs={12}>
          <Alert severity="info">
            Division, district, and Upazila / Thana are optional. Select them when you want more precise geographic filtering.
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default ProspectLocationSelector;
