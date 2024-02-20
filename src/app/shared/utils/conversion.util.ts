import { BasicOrientationType } from "../services/app-state.types";

export class ConversionUtil {
  private constructor() {}

  static basicOrientationType(orientation: OrientationType): BasicOrientationType {
    return orientation.split('-')[0] as BasicOrientationType;
  }

  static firstUpper(str: string): string {
    return `${str[0].toUpperCase()}${str.slice(1, str.length).toLowerCase()}`;
  }
}
