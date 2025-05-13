declare module 'fabric-pure-browser' {
  export namespace fabric {
    interface Object {
      left?: number;
      top?: number;
      angle?: number;
      scaleX?: number;
      scaleY?: number;
      set(property: string, value: any): this;
      set(options: { [key: string]: any }): this;
      setCoords(): void;
    }

    interface IText extends Object {
      text?: string;
      enterEditing(): void;
    }

    interface Canvas {
      add(...objects: Object[]): Canvas;
      remove(object: Object): Canvas;
      clear(): Canvas;
      renderAll(): Canvas;
      dispose(): void;
      setWidth(value: number): void;
      setHeight(value: number): void;
      getObjects(): Object[];
      on(event: string, handler: Function): void;
      sendToBack(object: Object): void;
      width?: number;
      height?: number;
    }

    interface Line extends Object {}
    interface Group extends Object {}
    interface Image extends Object {}
    interface Text extends Object {}

    class Canvas {
      constructor(element: HTMLCanvasElement, options?: any);
    }

    class IText {
      constructor(text: string, options?: any);
    }

    class Line {
      constructor(points: number[], options?: any);
    }

    class Group {
      constructor(objects: Object[], options?: any);
    }

    class Image {
      constructor(element: HTMLImageElement, options?: any);
    }

    class Text {
      constructor(text: string, options?: any);
    }

    function loadSVGFromString(string: string, callback: (objects: Object[], options: any) => void): void;
  }
} 