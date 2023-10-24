import cloudImage from "../public/images/kkk.svg";
import starImage from "../public/images/star-shine-svgrepo-com.svg";
import {gsap} from "gsap";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}


export const cloudGeneratingFunction = (rootElement, interval, dencity,speed) => {
  const changeThemeButton = document.querySelector("#changeThemeButton");
  let cloudAnimations=[]
  let isPaused = false

  changeThemeButton.addEventListener("click", (e) => {
    if (e.target.checked) {
      createClouds()
      for (let i = 0; i < cloudAnimations.length; i++) {
        cloudAnimations[i].play()
        isPaused = false
      }
    } else {
      for (let i = 0; i < cloudAnimations.length; i++) {
        cloudAnimations[i].pause()
        isPaused = true
      }

    }
  });


  const createClouds=()=>{
    for (let index = 0; index < dencity; index++) {
      const cloud = document.createElement("img");
      cloud.src = cloudImage.src;
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

      cloudAnimations.push(gsap.to(cloud,{left:leftValue,duration:speed, onComplete: ()=>{cloud.remove();cloudAnimations.shift()},force3D: true}))


    }
  }


  // createClouds()


  setInterval(() => {

    if (!document.hidden && !isPaused) {
      createClouds()
    }

  }, interval);
};


export const starGeneratingFunction = (rootElement,dencity)=>{
  let starAnimations=[]


  changeThemeButton.addEventListener("click", (e) => {
    if (e.target.checked) {

      for (let i = 0; i < starAnimations.length; i++) {
        starAnimations[i].pause()

      }
    } else {
      for (let i = 0; i < starAnimations.length; i++) {
        starAnimations[i].play()

      }

    }
  });







  for (let index = 0; index < dencity; index++) {
    const star = document.createElement("img");
    star.src = starImage.src;
    let topValue = getRandomIntInclusive(-rootElement.clientHeight/2, rootElement.clientHeight/2);
    let rightValue = getRandomIntInclusive(
        rootElement.clientWidth/2 ,
        -rootElement.clientWidth/2
    );

    star.classList.add("star");
    star.style.top = `${topValue}px`;
    star.style.right = `${rightValue}px`;
    star.style.scale=Math.random() * (0.05 - 0.02) + 0.02;
    star.style.rotate=Math.random() * (130 - 110) + 110;

    rootElement.append(star);



  if(index%3===0){
    let starTwinkleTimeLine=gsap.timeline({repeat:-1,force3D: true,paused:true});
    starTwinkleTimeLine.to(star,{opacity:1,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:0.5,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:0.3,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:0.1,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:0.3,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:0.5,duration:1,})
    starTwinkleTimeLine.to(star,{opacity:1,duration:1,})

    starAnimations.push(gsap.to(star,{rotate:180,repeat:-1,duration:12,paused:true}))
    starAnimations.push(starTwinkleTimeLine)
  }
    starAnimations.push(gsap.to(star,{rotate:180,repeat:-1,paused:true,duration:getRandomIntInclusive(
          12,
          24
      )}))

  }


}
