import {
  ObjectFieldTemplate,
  ArrayFieldTemplate,
  ArrayFieldItemTemplate,
  FieldTemplate,
  DescriptionField,
  TitleField,
  ErrorList,
} from '../components/rjsf-templates';
import {
  TextWidget,
  SelectWidget,
  CheckboxWidget,
  RadioWidget,
  RangeWidget,
  TextareaWidget,
  DateWidget,
  PasswordWidget,
  EmailWidget,
  URLWidget,
  FileWidget,
  ColorWidget,
  CheckboxesWidget,
  HiddenWidget,
} from '../components/rjsf-widgets';

const defaultTheme: any = {
  widgets: {
    TextWidget,
    SelectWidget,
    CheckboxWidget,
    RadioWidget,
    RangeWidget,
    TextareaWidget,
    DateWidget,
    PasswordWidget,
    EmailWidget,
    URLWidget,
    FileWidget,
    ColorWidget,
    CheckboxesWidget,
    HiddenWidget,
  },
  templates: {
    ObjectFieldTemplate,
    ArrayFieldTemplate,
    ArrayFieldItemTemplate,
    FieldTemplate,
    DescriptionField,
    TitleField,
    ErrorList,
  },
};

export const rjsfDaisyUiTheme = defaultTheme;
