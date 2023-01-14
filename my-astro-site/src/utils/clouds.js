import cloudImage from "../public/images/kkk.svg";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export const kill = (rootElement, interval,dencity) => {
    
  
  setTimeout(() => {
    for (let index = 0; index < dencity; index++) {
      const cloud = document.createElement("img");
      cloud.src = cloudImage;

      let topValue = getRandomIntInclusive(0, rootElement.offsetHeight-120);
      let leftValue = getRandomIntInclusive(0, -3000);

     console.log(rootElement.childNodes);
        setTimeout(()=>{
            rootElement.childNodes
        },interval*10)
      cloud.classList.add("cloud");
      cloud.style.top = `${topValue}px`;
      cloud.style.left = `${leftValue}px`;
      cloud.style.height=`${getRandomIntInclusive(80,150)}px`

      rootElement.append(cloud);
    }
  }, interval);
};
