import { useForm, usePage } from "@inertiajs/react";

const useBillingForm = (
    initialData,
    apartmentId,
    isEdit = false,
    billingData = {}
) => {
    const { flash } = usePage().props;

    const formData = isEdit
        ? {
              start_meter: billingData.start_meter,
              end_meter: billingData.end_meter,
              unit_price: billingData.unit_price,
              minimum_charge: billingData.minimum_charge,
              billing_fee: billingData.billing_fee || flash?.billing_fee,
              maintenance_type: initialData.maintenanceTypeSelected,
              vehicle_type_parking: initialData.vehicleTypeSelected,
              meter_reading: billingData.meter_reading || flash?.meter_reading,
              billing_date: billingData.billing_date,
              due_days: 10,
              billing_type: billingData.billing_type,
              water_type: initialData.waterTypeSelected,
              electric_type: initialData.electricTypeSelected,
              room_no: initialData.roomNo ? initialData.roomNo.value : "",
              status: billingData.status,
              period: billingData.period,
              end_meter_image_path: billingData.end_meter_image_path || null,
              apartment_id: apartmentId,
              tower_id: billingData.tower_id,
              paid_date: billingData.paid_date,
              owner_id: billingData.residence_id,
              fine: billingData.fine ?? 0,
              total_amount:
                  billingData.fine + billingData.billing_fee ||
                  flash?.total_amount,
              due_date: billingData.due_date,
          }
        : {
              billing_fee: "",
              total_amount: "",
              meter_reading: "",
              billing_date: "",
              due_days: 10,
              billing_type: "Air",
              fine: flash?.fine || "",
              minimum_charge: "",
              due_date: "",
              apartment_id: apartmentId,
              start_meter: "",
              end_meter: "",
              end_meter_image_path: null,
              unit_price: "",
              period: null,
              tower_id: "",
              water_type: initialData.waterPriceId || "",
              electric_type: "",
              maintenance_type: "",
              vehicle_type_parking: "",
          };

    const { data, setData, post, processing, errors, setError, clearErrors } =
        useForm(formData);

    return {
        data,
        setData,
        post,
        processing,
        errors,
        setError,
        clearErrors,
        flash,
    };
};

export default useBillingForm;
