//@flow
/**
* @Author: wansongHome
* @Date:   2016-06-15T00:16:08+08:00
* @Email:  betterofsong@gmail.com
*/

import React, { PropTypes } from 'react';
import {
  StyleSheet,
  View,
  PixelRatio,
} from 'react-native';
import { mergedStyle } from 'zhike-mobile-utils';

export default function ZKSeparatorLine(props) {
  return (
    <View style={mergedStyle(styles.separatorWrapper, props && props.style)} >
      <View style={[styles.separator, props && props.lineStyle]} />
    </View>
  );
}

ZKSeparatorLine.propTypes = {
  lineStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.number,
    PropTypes.array,
  ]),
};

let styles = StyleSheet.create({
  separator: {
    flex: 1,
    marginLeft: 46,
    backgroundColor: '#e6e6e6',
  },
  separatorWrapper: {
    backgroundColor: '#ffffff',
    height: 1.0 / PixelRatio.get(),
  },
});
