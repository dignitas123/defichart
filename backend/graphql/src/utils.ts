export function checkArrayIntersection(arr1: string[], arr2: string | string[] | undefined) {
    if (!arr2 || arr2.length === 0) {
      return false; // Empty or undefined array, no intersection
    }
  
    if (typeof arr2 === 'string') {
      return arr1.includes(arr2);
    }
  
    for (const element of arr1) {
      if (arr2.includes(element)) {
        return true; // Found a matching element
      }
    }
  
    return false; // No intersection found
  }
  