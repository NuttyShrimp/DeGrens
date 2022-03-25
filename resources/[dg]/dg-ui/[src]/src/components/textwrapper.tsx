import React, { FC, useEffect, useState } from 'react';

import { checkImageValidity, extractLinks } from '../lib/util';
import { styles } from '../styles/components/textwrapper.styles';

import { Imagecontainer } from './imagecontainer';

declare interface ExtractedImage {
  isLoading: boolean;
  src: string;
}

export const Textwrapper: FC<{ children: string }> = props => {
  const classes = styles();
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [strippedText, setStrippedText] = useState('');

  const loadImages = async () => {
    // eslint-disable-next-line prefer-const
    let { text, links } = extractLinks(props.children);
    let _images = links.map<ExtractedImage>(l => ({
      isLoading: true,
      src: l,
    }));
    setStrippedText(text);
    for (const link of links) {
      const valid = await checkImageValidity(link);
      if (valid) {
        const idx = _images.findIndex(p => p.src === link);
        if (idx < 0) {
          continue;
        }
        _images[idx].isLoading = false;
        continue;
      }
      // When the image is not valid
      _images = _images.filter(p => p.src !== link);
      // Check for string position of l in text
      const txtIdx = String(props.children).indexOf(link);
      if (txtIdx > -1) {
        // Put l at txtIdx position in string
        text = text.slice(0, txtIdx) + link + text.slice(txtIdx);
      }
    }
    setImages(_images);
    setStrippedText(text);
  };

  useEffect(() => {
    loadImages();
  }, [props.children]);

  return (
    <div className={classes.wrapper} style={images.length > 0 ? { minWidth: '21vh' } : {}}>
      <span>{strippedText}</span>
      <div className={classes.imageList}>
        {images.map((img, idx) => (
          <Imagecontainer url={img.src} loading={img.isLoading} key={idx} />
        ))}
      </div>
    </div>
  );
};
