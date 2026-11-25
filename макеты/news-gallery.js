(() => {
  const gallery = document.querySelector('.news-gallery');
  const track = gallery.querySelector('.news-gallery__track');
  const images = [...track.querySelectorAll('img')];
  const navigation = gallery.querySelector('.news-gallery__nav');
  const counter = navigation.querySelector('[data-gallery-index]');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const currentIndex = () => {
    const left = track.scrollLeft;
    return images.reduce((nearest, image, index) => {
      const distance = Math.abs(image.offsetLeft - left);
      return distance < Math.abs(images[nearest].offsetLeft - left) ? index : nearest;
    }, 0);
  };

  const showImage = index => track.scrollTo({
    left: images[index].offsetLeft,
    behavior: reduceMotion.matches ? 'instant' : 'smooth'
  });

  const step = direction => showImage(
    (currentIndex() + direction + images.length) % images.length
  );

  navigation.querySelector('[data-slide-prev]').addEventListener('click', () => step(-1));
  navigation.querySelector('[data-slide-next]').addEventListener('click', () => step(1));

  track.addEventListener('scroll', () => {
    const label = String(currentIndex() + 1).padStart(2, '0');
    if (counter.textContent !== label) counter.textContent = label;
  }, { passive: true });

  track.addEventListener('keydown', event => {
    const key = event.key;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
    event.preventDefault();
    if (key === 'Home') showImage(0);
    else if (key === 'End') showImage(images.length - 1);
    else step(key === 'ArrowLeft' ? -1 : 1);
  });

  track.classList.add('is-enhanced');
  navigation.hidden = false;
})();
