//@flow
/**
* @Author: wansongmbpwork
* @Date:   2016-08-19T13:32:38+08:00
* @Email:  betterofsong@gmail.com
*/

import React, { Component, PropTypes } from 'react';
import {
  TextInput,
  View,
  Text,
} from 'react-native';

export default class ZKTextInput extends Component {
  static propTypes = {
    onChangeText: PropTypes.func,// (key, text) => ...{}
    initialText: PropTypes.string,
    id: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = { text:this.props.initialText };
    this._onChangeText = this._onChangeText.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ text:nextProps.initialText ? nextProps.initialText : '' });
  }

  _inputMatchesAnnotation() {
    if (!this.props.annotations) return false;
    const notes = this.props.annotations.length && typeof this.props.annotations !== 'string' ?
      this.props.annotations.map(
        item =>
           (typeof item === 'string' ? item.toLowerCase().trim() : item)
      )
      :
    [
      typeof this.props.annotations === 'string' ?
        this.props.annotations.toLowerCase().trim() :
        this.props.annotations
    ];
    return this.state.text && new Set(notes).has(this.state.text.toLowerCase().trim());
  }

  _shouldWarnInput() {
    return this.props.annotations && !this._inputMatchesAnnotation();
  }

  _onChangeText(text) {
    this.setState({ text });
    this.props.onChangeText && this.props.onChangeText(this.props.id, text);
  }

  render() {
    // let {width, height, ...otherStyle} = this.props.style;
    const warnInput = {
      color: 'red',
      textDecorationLine: 'line-through',
      textDecorationColor: '#999999',
    };

    const style = [{ flex:1, color:'gray' }, this._shouldWarnInput() ? warnInput : null];
    const underline = { borderBottomWidth:1, borderBottomColor:'#00b5e9' };
    const halfWidthSize = { width:100, height:this.props.style.height };
    return (
      <View style={[this.props.style, { flexDirection:'row', }, this._shouldWarnInput() ? null : underline]}>
        {[
          this._shouldWarnInput() ?
            <View key={1} style={[underline, halfWidthSize, { flex:1 }]} >
              <Text
                style={[style, { flex:1, alignSelf:'stretch' }]}
              >
                {`${this.state.text}`}
              </Text>
            </View>
            :
              <TextInput
                key={1}
                style={style}
                onChangeText={this._onChangeText}
                value={this.state.text}
                editable={!this.props.forbidEdit}
              />,

          this._shouldWarnInput() ?
            <Text key={2} >{`(${typeof this.props.annotations === 'string' ? this.props.annotations : (this.props.annotations && this.props.annotations[0] ? this.props.annotations[0] : this.props.annotations)})`}</Text>
            : null
        ]}
      </View>
    );
  }

}
