import { FieldError } from "../resolvers/user";
const illegalChars = ['(', ')', ';', ':', '{', '}']
const checkForIllegalChars = (str: string, chars: string[]): boolean => {
    const size = chars.length;
    for (let t = 0; t < size; t++) {
        if (str.indexOf(chars[t]) !== -1) return true;
    }
    return false;
}
const checkLength=(str:string,low:number,high:number,name:string) :string |null=>{
    if(str.length < low) return `${name} too short, must contain atleast ${low} letters`
    if(str.length > high) return `${name} too long, must not contain more than ${high} chars`
    return null;
}
export const validateEmail = (email: string): string | null => {
    if (checkForIllegalChars(email, illegalChars)) return 'Please enter a valid email';
    if (!(email.includes('@') && email.includes('.')) || email.length < 6 || email.length>60) return 'Please enter a valid email';
    return null;
}
export const validateUsername = (username: string): string | null => {
    if (checkForIllegalChars(username, [...illegalChars, '@'])) return "Username can only contain _ symbol";
    const lenerr=checkLength(username,3,15,'username')
    if(lenerr) return lenerr;
    return null;
}
export const validatePassword = (password: string): string | null => {
    if (checkForIllegalChars(password, illegalChars)) return "Password can containe only !,@,#,$,% as special characters"
    const lenerr=checkLength(password,6,15,'password')
    if(lenerr) return lenerr;
    return null;
}

export const validateRegisterCred =(email:string,password:string,username:string) : FieldError[] | null => {
    let errsArr=[];
    let err=validateEmail(email);
    if(err) errsArr.push({field:'email',message:`${err}`})
    err=validatePassword(password);
    if(err) errsArr.push({field:'password',message:`${err}`})
    err=validateUsername(username);
    if(err) errsArr.push({field:'username',message:`${err}`})
    if(errsArr.length>0) return errsArr;
    return null;
}

