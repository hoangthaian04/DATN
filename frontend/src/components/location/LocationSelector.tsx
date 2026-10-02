import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';
import { SearchableLocationSelect } from './SearchableLocationSelect';

interface Props {
  provinceCode: string;
  wardCode: string;
  onProvinceChange: (provinceCode: string, provinceName: string) => void;
  onWardChange: (wardCode: string, wardName: string) => void;
  disabled?: boolean;
  required?: boolean;
}

export const LocationSelector: React.FC<Props> = ({
  provinceCode,
  wardCode,
  onProvinceChange,
  onWardChange,
  disabled = false,
  required = false,
}) => {
  const provincesQuery = useQuery({
    queryKey: ['provinces'],
    queryFn: locationService.getProvinces,
    staleTime: Infinity,
  });
  const wardsQuery = useQuery({
    queryKey: ['wards', provinceCode],
    queryFn: () => locationService.getWards(provinceCode),
    enabled: Boolean(provinceCode),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (provinceCode && wardCode && wardsQuery.data && !wardsQuery.data.some(ward => ward.code === wardCode)) {
      onWardChange('', '');
    }
  }, [provinceCode, wardCode, wardsQuery.data, onWardChange]);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SearchableLocationSelect
        label="Tỉnh / thành phố"
        value={provinceCode}
        options={provincesQuery.data || []}
        placeholder="— Chọn tỉnh / thành phố —"
        searchPlaceholder="Tìm tỉnh / thành phố..."
        loadingText="Đang tải tỉnh thành..."
        emptyText="Không tìm thấy tỉnh / thành phố."
        disabled={disabled}
        loading={provincesQuery.isLoading}
        required={required}
        onChange={code => {
          const province = provincesQuery.data?.find(item => item.code === code);
          onProvinceChange(code, province?.name || '');
        }}
      />
      <SearchableLocationSelect
        label="Xã / phường"
        value={wardCode}
        options={wardsQuery.data || []}
        placeholder={provinceCode ? '— Chọn xã / phường —' : 'Chọn tỉnh / thành phố trước'}
        searchPlaceholder="Tìm xã / phường..."
        loadingText="Đang tải xã phường..."
        emptyText="Không tìm thấy xã / phường."
        disabled={disabled || !provinceCode}
        loading={wardsQuery.isLoading}
        required={required}
        onChange={code => {
          const ward = wardsQuery.data?.find(item => item.code === code);
          onWardChange(code, ward?.name || '');
        }}
      />
      {provincesQuery.isError || wardsQuery.isError ? <p role="alert" className="text-xs text-rose-600 sm:col-span-2">Không tải được dữ liệu địa chỉ. Vui lòng thử lại.</p> : null}
    </div>
  );
};
