// @flow
/**
* @Author: wansong
* @Date:   2016-06-24T13:06:59+08:00
* @Email:  betterofsong@gmail.com
*/


import React, { PropTypes } from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

const loadingImage = require('./img/img-loading.gif');

export default function LoadingView(props:Object) {
  return (
    <View style={[styles.container, props.style]}>
      <Image
        style={props.imageStyle}
        source={props.image}
        resizeMode={'contain'}
      />
    </View>
  );
}

LoadingView.propTypes = {
  image: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
  imageStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
  ]),
};

LoadingView.defaultProps = {
  image: loadingImage,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    alignSelf: 'stretch',
  },
});
