import cloudImage from "../public/images/kkk.svg";
import {gsap} from "gsap";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export const kill = (rootElement, interval, dencity,speed) => {


  for (let index = 0; index < dencity; index++) {
    const cloud = document.createElement("img");
    cloud.src = cloudImage;
    let topValue = getRandomIntInclusive(0, rootElement.offsetHeight - 120);
    let rightValue = getRandomIntInclusive(
        -200,
        -1600
    );





    cloud.classList.add("cloud");
    cloud.style.top = `${topValue}px`;
    cloud.style.right = `${rightValue}px`;
    cloud.style.scale=Math.random() * (1.4 - 0.7) + 0.7;

    rootElement.append(cloud);
    let leftValue = getRandomIntInclusive(
        -400,
        -1000
    );



    gsap.to(cloud,{left:leftValue,duration:speed, onComplete: ()=>cloud.remove(),})

  }





  setInterval(() => {

    if (!document.hidden) {


    for (let index = 0; index < dencity; index++) {
      const cloud = document.createElement("img");
      cloud.src = cloudImage;
      let topValue = getRandomIntInclusive(0, rootElement.offsetHeight - 120);
      let rightValue = getRandomIntInclusive(
        -200,
          -1600
      );

      let cloudScale = getRandomIntInclusive(
          0,
          2
      );



      cloud.classList.add("cloud");
      cloud.style.top = `${topValue}px`;
      cloud.style.right = `${rightValue}px`;
      cloud.style.scale=Math.random() * (1.4 - 0.7) + 0.7;

      rootElement.append(cloud);
      let leftValue = getRandomIntInclusive(
          -400,
          -1000
      );


      gsap.to(cloud,{left:leftValue,duration:speed, onComplete: ()=>cloud.remove(),})

    }
    }
  }, interval);
};
