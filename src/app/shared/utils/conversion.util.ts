import { BasicOrientationType } from "../services/app-state.types";

export class ConversionUtil {
  private constructor() {}

  static basicOrientationType(orientation: OrientationType): BasicOrientationType {
    return orientation.split('-')[0] as BasicOrientationType;
  }
}
