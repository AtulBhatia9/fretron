function example() {
    var x = 1;
    let y = 2;
    const z = 3;
  
    if (true) {
      var x = 10; // Function-scoped variable
      let y = 20; // Block-scoped variable
      const z = 30; // Block-scoped variable
      console.log(x, y, z); // 10, 20, 30
    }
  
    console.log(x, y, z); // 10, 2, 3
  }
  
  example();
  