import cloudImage from "../public/images/kkk.svg";

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

export const kill = (rootElement, interval, dencity) => {
  setTimeout(() => {
    let margin = 200;

    for (let index = 0; index < dencity; index++) {
      const cloud = document.createElement("img");
      cloud.src = cloudImage;
      let topValue = getRandomIntInclusive(0, rootElement.offsetHeight - 120);
      let leftValue = getRandomIntInclusive(
        rootElement.offsetWidth - margin,
        rootElement.offsetWidth + 400
      );
      margin -= 200;
      cloud.classList.add("cloud");
      cloud.style.top = `${topValue}px`;
      cloud.style.left = `${leftValue}px`;
      cloud.style.height=`${getRandomIntInclusive(80,150)}px`

      rootElement.append(cloud);

      const moveLeft = (timestamp) => {
        cloud.style.left = `${cloud.getBoundingClientRect().left - 3}px`;
        if (cloud.getBoundingClientRect().right < 0) {
          let newtop = `${getRandomIntInclusive(
            0,
            rootElement.offsetHeight - 120
          )}px`;

          let newLeft = `${getRandomIntInclusive(
            rootElement.offsetWidth-margin,
            rootElement.offsetWidth + 400
          )}px`;

          cloud.style.top = newtop;
          cloud.style.left = newLeft;
        }
        window.requestAnimationFrame(moveLeft);
      };

      window.requestAnimationFrame(moveLeft);
    }
  }, interval);
};
