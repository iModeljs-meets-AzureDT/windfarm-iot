import * as React from "react";

export default class HoverImage extends React.Component<{src: string, hoverSrc: string}, {imageSrc: string}> {

  constructor(props: any) {
    super(props);
    this.state = {imageSrc: props.src};
  }

  private mouseOver = () => {
    this.setState({imageSrc: this.props.hoverSrc});
  }

  private mouseOut = () => {
    this.setState({imageSrc: this.props.src});
  }
  

  render() {
    return (
      <img
        src={this.state.imageSrc}
        onMouseOver={this.mouseOver}
        onMouseOut={this.mouseOut}
      />
    );
  }

}
