import React, { useRef, useEffect, useState } from 'react';
import WebViewer from '@pdftron/webviewer';
import './App.css';

// const  [canvasArr, setCanvasArr] =useState([]);
const App = () => {
  const viewer = useRef(null);

  useEffect(() => {
    WebViewer(
      {
        path: '/webviewer/lib',
        initialDoc: 'https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf',
        enableFilePicker: true,    // enable FILE SYSTEM 
      },
      viewer.current,
    ).then((instance) => { 


      // code for custom annotaions
      // const { documentViewer, annotationManager, Annotations, Tools, iframeWindow, annotManager } = instance.Core;

      // documentViewer.addEventListener('documentLoaded', () => {
      //   const rectangleAnnot = new Annotations.RectangleAnnotation({
      //     PageNumber: 1,
      //     // values are in page coordinates with (0, 0) in the top left
      //     X: 170,
      //     Y: 325,
      //     Width: 300,
      //     Height: 55,
      //     Author: annotationManager.getCurrentUser()
      //   });

      //   annotationManager.addAnnotation(rectangleAnnot);
      //   // need to draw the annotation otherwise it won't show up until the page is refreshed
      //   annotationManager.redrawAnnotation(rectangleAnnot);
        
       
        
      // });

      // const annotManager = instance.annotManager
      // annotManager.addEventListener('annotationChanged', (annotations, action) => {
      //   // console.log(annotations)
      //   const annotationList = annotManager.getAnnotationsList()
      //   console.log(annotationList);
      // });
      // samplesSetup(instance);


      // sniping tool code
      const { docViewer, Annotations, Tools, iframeWindow, annotManager } = instance;
      
      const createSnipTool = function() {
        const SnipTool = function() {
          Tools.RectangleCreateTool.apply(this, arguments);
          this.defaults.StrokeColor = new Annotations.Color('#F69A00');
          this.defaults.StrokeThickness = 2;
        }
      
        SnipTool.prototype = new Tools.RectangleCreateTool();
        
        return new SnipTool(docViewer);
      };

      const customSnipTool = createSnipTool();

      instance.registerTool({
        toolName: 'SnipTool',
        toolObject: customSnipTool,
        buttonImage: '/cut-solid.svg',
        buttonName: 'snipToolButton',
        tooltip: 'Snipping Tool'
      });

      instance.setHeaderItems(header => {
        header.push({
          type: 'toolButton',
          toolName: 'SnipTool',
        });
      });

      const downloadURI = (uri, name) => {
        const link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      customSnipTool.on('annotationAdded', (annotation) => {
        const pageNumber = annotation.PageNumber;
        // get the canvas for the page
        const pageContainer = iframeWindow.document.getElementById('pageContainer' + pageNumber);
        const pageCanvas = pageContainer.querySelector('.canvas' + pageNumber);

        const scale = window.devicePixelRatio
        const topOffset = (parseFloat(pageCanvas.style.top) || 0) * scale;
        const leftOffset = (parseFloat(pageCanvas.style.left) || 0) *  scale;
         const zoom = docViewer.getZoomLevel() * scale;

        const x = annotation.X * zoom - leftOffset;
        const y = annotation.Y * zoom - topOffset;
        const width = annotation.Width * zoom;
        const height = annotation.Height * zoom;

        const copyCanvas = document.createElement('canvas');
        copyCanvas.width = width;
        copyCanvas.height = height;
        const ctx = copyCanvas.getContext('2d');
        // copy the image data from the page to a new canvas so we can get the data URL

        ctx.drawImage(pageCanvas, x, y, width, height, 0, 0, width, height);

        // console.log(widthList, heightList);
        downloadURI(copyCanvas.toDataURL(), "sample.jpeg");
    
        annotManager.deleteAnnotation(annotation);
      });

    });
  }, []);

  const exportModel = () => {
    
  }
  return (
    <div className="App">
      <div className="header">ManageArtworks</div>
      <div className="webviewer" ref={viewer}></div>
    </div>
  );
};

export default App;
