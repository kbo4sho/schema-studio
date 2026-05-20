import { useId, type ComponentPropsWithRef, type HTMLAttributes, type ReactNode } from "react";
import styles from "./FormControls.module.css";

export type SelectOption = {
  label: string;
  value: string;
};

type FieldRootProps = HTMLAttributes<HTMLDivElement>;
type FieldsetRootProps = HTMLAttributes<HTMLFieldSetElement>;
type NativeInputProps = ComponentPropsWithRef<"input">;
type NativeSelectProps = ComponentPropsWithRef<"select">;
type NativeTextareaProps = ComponentPropsWithRef<"textarea">;

type SharedFieldProps<RootProps> = {
  label: string;
  required?: boolean;
  helpText?: string;
  error?: string;
  fullWidth?: boolean;
  rootProps?: RootProps;
};

export type TextFieldProps = SharedFieldProps<FieldRootProps> & {
  inputProps?: NativeInputProps;
};

export type TextareaFieldProps = SharedFieldProps<FieldRootProps> & {
  textareaProps?: NativeTextareaProps;
};

export type SelectFieldProps = SharedFieldProps<FieldRootProps> & {
  options: SelectOption[];
  placeholder?: string;
  selectProps?: NativeSelectProps;
};

export type RadioGroupFieldProps = SharedFieldProps<FieldsetRootProps> & {
  options: SelectOption[];
  inputProps?: NativeInputProps;
};

export type CheckboxFieldProps = SharedFieldProps<FieldRootProps> & {
  inputProps?: NativeInputProps;
};

export function TextField({ label, required, helpText, error, fullWidth, rootProps, inputProps }: TextFieldProps) {
  const generatedId = useId();
  const { className: inputClassName, id: inputId, ...nativeInputProps } = inputProps ?? {};
  const id = inputId ?? generatedId;
  const invalid = Boolean(error);

  return (
    <FieldRoot fullWidth={fullWidth} rootProps={rootProps}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        {...nativeInputProps}
        id={id}
        className={cx(styles.control, inputClassName)}
        aria-invalid={invalid || nativeInputProps["aria-invalid"] || undefined}
      />
      <FieldMeta helpText={helpText} error={error} />
    </FieldRoot>
  );
}

export function TextareaField({
  label,
  required,
  helpText,
  error,
  fullWidth,
  rootProps,
  textareaProps
}: TextareaFieldProps) {
  const generatedId = useId();
  const { className: textareaClassName, id: textareaId, ...nativeTextareaProps } = textareaProps ?? {};
  const id = textareaId ?? generatedId;
  const invalid = Boolean(error);

  return (
    <FieldRoot fullWidth={fullWidth} rootProps={rootProps}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        {...nativeTextareaProps}
        id={id}
        className={cx(styles.control, textareaClassName)}
        aria-invalid={invalid || nativeTextareaProps["aria-invalid"] || undefined}
      />
      <FieldMeta helpText={helpText} error={error} />
    </FieldRoot>
  );
}

export function SelectField({
  label,
  required,
  helpText,
  error,
  fullWidth,
  rootProps,
  options,
  placeholder,
  selectProps
}: SelectFieldProps) {
  const generatedId = useId();
  const { className: selectClassName, id: selectId, ...nativeSelectProps } = selectProps ?? {};
  const id = selectId ?? generatedId;
  const invalid = Boolean(error);

  return (
    <FieldRoot fullWidth={fullWidth} rootProps={rootProps}>
      <FieldLabel htmlFor={id} label={label} required={required} />
      <select
        {...nativeSelectProps}
        id={id}
        className={cx(styles.control, selectClassName)}
        aria-invalid={invalid || nativeSelectProps["aria-invalid"] || undefined}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FieldMeta helpText={helpText} error={error} />
    </FieldRoot>
  );
}

export function RadioGroupField({
  label,
  required,
  helpText,
  error,
  fullWidth,
  rootProps,
  options,
  inputProps
}: RadioGroupFieldProps) {
  const { className: fieldsetClassName, ...nativeFieldsetProps } = rootProps ?? {};
  const { className: inputClassName, ...nativeInputProps } = inputProps ?? {};
  const invalid = Boolean(error);

  return (
    <fieldset
      {...nativeFieldsetProps}
      className={cx(styles.field, styles.optionGroup, fullWidth && styles.fullWidth, fieldsetClassName)}
      aria-invalid={invalid || nativeFieldsetProps["aria-invalid"] || undefined}
    >
      <legend className={styles.legend}>
        {label}
        <RequiredMark required={required} />
      </legend>
      {options.map((option) => (
        <label className={styles.choiceRow} key={option.value}>
          <input
            {...nativeInputProps}
            type="radio"
            value={option.value}
            className={cx(styles.choiceControl, inputClassName)}
            aria-invalid={invalid || nativeInputProps["aria-invalid"] || undefined}
          />
          <span className={styles.choiceText}>{option.label}</span>
        </label>
      ))}
      <FieldMeta helpText={helpText} error={error} />
    </fieldset>
  );
}

export function CheckboxField({
  label,
  required,
  helpText,
  error,
  fullWidth,
  rootProps,
  inputProps
}: CheckboxFieldProps) {
  const generatedId = useId();
  const { className: inputClassName, id: inputId, ...nativeInputProps } = inputProps ?? {};
  const id = inputId ?? generatedId;
  const invalid = Boolean(error);

  return (
    <FieldRoot fullWidth={fullWidth} rootProps={rootProps} className={styles.checkboxField}>
      <label className={styles.choiceRow} htmlFor={id}>
        <input
          {...nativeInputProps}
          id={id}
          type="checkbox"
          className={cx(styles.choiceControl, inputClassName)}
          aria-invalid={invalid || nativeInputProps["aria-invalid"] || undefined}
        />
        <span className={styles.choiceText}>
          {label}
          <RequiredMark required={required} />
        </span>
      </label>
      <FieldMeta helpText={helpText} error={error} />
    </FieldRoot>
  );
}

function FieldRoot({
  children,
  fullWidth,
  rootProps,
  className
}: {
  children: ReactNode;
  fullWidth?: boolean;
  rootProps?: FieldRootProps;
  className?: string;
}) {
  const { className: rootClassName, ...nativeRootProps } = rootProps ?? {};

  return (
    <div {...nativeRootProps} className={cx(styles.field, fullWidth && styles.fullWidth, className, rootClassName)}>
      {children}
    </div>
  );
}

function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label className={styles.label} htmlFor={htmlFor}>
      {label}
      <RequiredMark required={required} />
    </label>
  );
}

function RequiredMark({ required }: { required?: boolean }) {
  return required ? (
    <span className={styles.requiredMark} aria-hidden="true">
      {" "}
      *
    </span>
  ) : null;
}

function FieldMeta({ helpText, error }: { helpText?: string; error?: string }) {
  return (
    <>
      {helpText ? <small className={styles.help}>{helpText}</small> : null}
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

function cx(...classNames: Array<string | false | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
