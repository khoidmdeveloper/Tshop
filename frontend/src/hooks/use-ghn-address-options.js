import { useEffect, useState } from "react";
import { getDistrictsApi, getProvincesApi, getWardsApi } from "@/lib/api/shipping-api";

export function useGhnAddressOptions(provinceId, districtId) {
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const data = await getProvincesApi();
        if (mounted) {
          setProvinces(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (mounted) {
          setProvinces([]);
        }
        console.error("Failed to load provinces", error);
      } finally {
        if (mounted) {
          setIsLoadingProvinces(false);
        }
      }
    };

    void loadProvinces();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return () => {
        mounted = false;
      };
    }

    const loadDistricts = async () => {
      try {
        const data = await getDistrictsApi(provinceId);
        if (mounted) {
          setDistricts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (mounted) {
          setDistricts([]);
        }
        console.error("Failed to load districts", error);
      }
    };

    void loadDistricts();

    return () => {
      mounted = false;
    };
  }, [provinceId]);

  useEffect(() => {
    let mounted = true;

    if (!districtId) {
      setWards([]);
      return () => {
        mounted = false;
      };
    }

    const loadWards = async () => {
      try {
        const data = await getWardsApi(districtId);
        if (mounted) {
          setWards(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (mounted) {
          setWards([]);
        }
        console.error("Failed to load wards", error);
      }
    };

    void loadWards();

    return () => {
      mounted = false;
    };
  }, [districtId]);

  return {
    provinces,
    districts,
    wards,
    isLoadingProvinces,
  };
}
