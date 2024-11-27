let rotate = function (nums, k) {
  const n = nums.length;
  if (k === 0) return;
  console.log(k % n);
  let last = nums.splice(n - (k % n), k); //后 k 个元素
  console.log('nums', nums);

  nums.unshift(...last);
  return nums;
};

let nums = [1, 2, 3, 4, 5, 6, 7];
console.log(rotate(nums, 3));
console.log('====================', nums.splice(7 - 3, 3));
