import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customNumberFormat'
})
export class CustomNumberFormatPipe implements PipeTransform {

  transform(value: number | string): string {
    if (!value) return '0';

    // Ensure value is a number
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    // Split the number into the integer and decimal parts
    const [integerPart, decimalPart] = num.toFixed(2).split('.');

    // Add dots as thousand separators in the integer part
    const integerWithDots = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    // Return the formatted number with comma as decimal separator
    return `${integerWithDots},${decimalPart}`;
  }
}