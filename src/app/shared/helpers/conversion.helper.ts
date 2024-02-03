import { BasicOrientationType } from "../services/app-state.types";

export class ConversionHelper {
  private constructor() {}

  static basicOrientationType(orientation: OrientationType): BasicOrientationType {
    return orientation.split('-')[0] as BasicOrientationType;
  }
}
