
function rangeOfNumbers(s,e){
    if(s<=e){
        let a = rangeOfNumbers(s,e-1);
        a.push(e);
        return a;
    }else{
        return [];
    }
}
console.log(rangeOfNumbers(4, 4))