import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';

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
      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Tỉnh / thành phố{required && ' *'}</span>
        <select
          required={required}
          disabled={disabled || provincesQuery.isLoading}
          value={provinceCode}
          onChange={event => {
            const province = provincesQuery.data?.find(item => item.code === event.target.value);
            onProvinceChange(event.target.value, province?.name || '');
          }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{provincesQuery.isLoading ? 'Đang tải tỉnh thành...' : '— Chọn tỉnh / thành phố —'}</option>
          {(provincesQuery.data || []).map(province => <option key={province.code} value={province.code}>{province.name}</option>)}
        </select>
      </label>
      <label className="block space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Xã / phường{required && ' *'}</span>
        <select
          required={required}
          disabled={disabled || !provinceCode || wardsQuery.isLoading}
          value={wardCode}
          onChange={event => {
            const ward = wardsQuery.data?.find(item => item.code === event.target.value);
            onWardChange(event.target.value, ward?.name || '');
          }}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-primary-500 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{!provinceCode ? 'Chọn tỉnh / thành phố trước' : wardsQuery.isLoading ? 'Đang tải xã phường...' : '— Chọn xã / phường —'}</option>
          {(wardsQuery.data || []).map(ward => <option key={ward.code} value={ward.code}>{ward.name}</option>)}
        </select>
      </label>
      {provincesQuery.isError || wardsQuery.isError ? <p role="alert" className="text-xs text-rose-600 sm:col-span-2">Không tải được dữ liệu địa chỉ. Vui lòng thử lại.</p> : null}
    </div>
  );
};
