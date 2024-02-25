import { Pipe, PipeTransform } from '@angular/core';
import { ConversionUtil } from '../utils/conversion.util';

@Pipe({
  name: 'firstUpper'
})
export class FirstUpperPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return ConversionUtil.firstUpper(value);
  }

}
