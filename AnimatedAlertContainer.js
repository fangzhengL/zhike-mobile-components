// @flow
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  TouchableWithoutFeedback,
  Animated,
  View,
} from 'react-native';

const DEFAULT_CONTENT_HEIGHT_ESTIMATED = 150;

export default class AnimatedAlertContainer extends Component {
  static propTypes = {
    onHide: PropTypes.func,
  }

  static defaultProps = {
    hideOnTap:true,
  }

  state: { height:number, contentContainerBottomAnim:Object }
  progress:Object
  backgroundColorAnim:Object
  contentContainerBottomAnim:Object
  _onContentViewLayout:(e:any) => void

  constructor(props:any) {
    super(props);
    this.progress = new Animated.Value(0);
    this.state = {
      height: DEFAULT_CONTENT_HEIGHT_ESTIMATED,
      contentContainerBottomAnim: this._genContentContainerBottomAnim(DEFAULT_CONTENT_HEIGHT_ESTIMATED),
    };
    this.backgroundColorAnim = this.progress.interpolate({
      inputRange:[0, 1],
      outputRange:['transparent', '#0000003c'],
    });
    this._onContentViewLayout = this._onContentViewLayout.bind(this);
  }

  componentDidMount() {
    this._beginAnimation();
  }

  _genContentContainerBottomAnim(height) {
    return this.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [-height, 0],
    });
  }

  _onContentViewLayout(e) {
    const height = (
      e &&
      e.nativeEvent &&
      e.nativeEvent.layout &&
      e.nativeEvent.layout.height ||
      DEFAULT_CONTENT_HEIGHT_ESTIMATED
    );
    if (height !== this.state.height) {
      this.setState({ height, contentContainerBottomAnim:this._genContentContainerBottomAnim(height) });
    }
  }

  _beginAnimation() {
    Animated.timing(
      this.progress,
      {
        toValue:1,
        duration:250,
      }
    ).start();
  }

  hide(ctx:any) {
    Animated.timing(
      this.progress,
      {
        toValue:0,
        duration:250,
      }
    ).start(() => (this.props.onHide && this.props.onHide(ctx)));
  }

  render() {
    return (
      <TouchableWithoutFeedback
        onPress={this.props.hideOnTap ? () => this.hide() : null}
      >
        <Animated.View
          style={{ flex:1, alignSelf:'stretch', backgroundColor:this.backgroundColorAnim }}
        >
          <Animated.View
            style={{ position:'absolute', left:0, right:0, bottom:this.state.contentContainerBottomAnim }}
          >
            <View
              onLayout={this._onContentViewLayout}
            >
              {
                this.props.children
              }
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    );
  }
}
