import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name:'noSpace'
})
export class NOSpace implements PipeTransform{
    transform(value: string) {
      return value.replaceAll(' ','')
    }
    
}