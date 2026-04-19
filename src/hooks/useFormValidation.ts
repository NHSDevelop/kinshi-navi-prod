/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { ZodSchema, ZodError } from "zod";

type ValidationErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormValidationProps<T> {
  schema: ZodSchema;
  initialValues?: Partial<T>;
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  setValue: (field: keyof T, value: any) => void;
  setTouched: (field: keyof T, touched: boolean) => void;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  validateField: (field: keyof T) => boolean;
  validateAll: () => boolean;
  isValid: boolean;
  reset: () => void;
  setValues: (values: Partial<T>) => void;
}

export function useFormValidation<T extends Record<string, any>>({
  schema,
  initialValues = {},
}: UseFormValidationProps<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues as T);
  const [errors, setErrors] = useState<ValidationErrors<T>>({});
  const [touched, setTouchedState] = useState<
    Partial<Record<keyof T, boolean>>
  >({});

  const validateField = useCallback(
    (field: keyof T): boolean => {
      try {
        const fieldValue = { [field]: values[field] };
        const fieldSchema = (schema as any).pick({ [field]: true });
        fieldSchema.parse(fieldValue);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.issues[0]?.message || "入力エラー";
          setErrors((prev) => ({
            ...prev,
            [field]: fieldError,
          }));
        }
        return false;
      }
    },
    [values, schema],
  );

  const validateAll = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: ValidationErrors<T> = {};
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof T;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [schema, values]);

  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));
      if (touched[field]) {
        validateField(field);
      }
    },
    [touched, validateField],
  );

  const setTouched = useCallback((field: keyof T, isTouched: boolean) => {
    setTouchedState((prev) => ({ ...prev, [field]: isTouched }));
    if (isTouched) {
      // 触れた時点でバリデーションを実行
      // ただし、実際の検証は validateField で行う
    }
  }, []);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      const inputValue =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
      setValue(name as keyof T, inputValue);
    },
    [setValue],
  );

  const handleBlur = useCallback(
    (
      e: React.FocusEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name } = e.target;
      setTouched(name as keyof T, true);
      validateField(name as keyof T);
    },
    [setTouched, validateField],
  );

  const reset = useCallback(() => {
    setValuesState(initialValues as T);
    setErrors({});
    setTouchedState({});
  }, [initialValues]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    setValue,
    setTouched,
    handleChange,
    handleBlur,
    validateField,
    validateAll,
    isValid,
    reset,
    setValues,
  };
}
