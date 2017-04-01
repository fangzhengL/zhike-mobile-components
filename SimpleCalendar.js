// @flow

import React, {
  Component,
  PropTypes,
} from 'react';
import {
  Text,
  View,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import _ from 'lodash';

const { width: ScreenWidth } = Dimensions.get('window');
const DateCellWidth = ScreenWidth / 7.0 - 20;

export default class SimpleCalendar extends Component {
  static _daysInCurrentWeek() {
    const x = new Date();
    const date = x.getDate();
    const day = x.getDay();
    return _.range(7).map(
      (ii) => {
        const xx = new Date(x.getTime());
        xx.setDate(ii + date - day);
        return xx;
      }
    );
  }

  static _dateFromOffset(date, offset) {
    const ret = new Date(date.getTime());
    ret.setDate(offset + ret.getDate());
    return ret;
  }

  static _lastCurrentNextWeekdays(weekOffset) {
    const currentWeekdays = this._daysInCurrentWeek();
    return {
      lastWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, -7 + 7 * weekOffset)),
      currentWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, 7 * weekOffset)),
      nextWeekdays: currentWeekdays.map(date => this._dateFromOffset(date, 7 + 7 * weekOffset)),
    };
  }

  static _dayString = (
    function () {
      const WeekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return ii => WeekNames[ii];
    }
  )();

  static _compareDateByDay(d1, d2) {
    if (d1.getFullYear() < d2.getFullYear()) {
      return -1;
    } else if (d1.getFullYear() > d2.getFullYear()) {
      return 1;
    } else if (d1.getMonth() < d2.getMonth()) {
      return -1;
    } else if (d1.getMonth() > d2.getMonth()) {
      return 1;
    } else {
      return d1.getDate() - d2.getDate();
    }
  }

  static _isDateEqualByDay(d1, d2) {
    return this._compareDateByDay(d1, d2) === 0;
  }

  static _isFuture(d) {
    return this._compareDateByDay(new Date(), d) < 0;
  }

  static propTypes = {
    textForToday:PropTypes.string,
    onDateSelected: PropTypes.func,
    date: PropTypes.instanceOf(Date),  // eslint-disable-line
  };

  static defaultProps = {
    date: new Date(),
  };

  static _futureDateTextStyle() {
    return {
      color: '#8f9ba6',
      fontSize: 14,
    };
  }


  state: {
    weekOffset: number,
    lastWeekdays: number,
    currentWeekdays: number,
    nextWeekdays: number,
  }
  _onScrollEnd:(e:any) => void
  scrollView: any

  constructor(props:any) {
    super(props);
    this.state = {
      // weekOffset restrained to be positive
      weekOffset: 0,
      ...SimpleCalendar._lastCurrentNextWeekdays(0),
    };
    this._onScrollEnd = this._onScrollEnd.bind(this);
  }

  componentDidMount() {
    this._adjustScroll();
  }

  _isSelectedDate(d1) {
    return this.constructor._isDateEqualByDay(d1, this.props.date);
  }

  _onScrollEnd(e) {
    const newOffset = e.nativeEvent.contentOffset.x;
    const nextState = {};
    if (newOffset - ScreenWidth > 0) {
      nextState.weekOffset = this.state.weekOffset + 1;
    } else if (newOffset - ScreenWidth < 0) {
      nextState.weekOffset = this.state.weekOffset - 1;
    }
    this.setState(
      nextState,
      () => this._adjustScroll()
    );
  }

  _adjustScroll() {
    this.scrollView && this.scrollView.scrollTo({ x:ScreenWidth, animated:false });
  }

  _onSelectDate(date) {
    if (!this.constructor._isFuture(date)) {
      console.log('selected date: ', date);
      this.props && this.props.onDateSelected && this.props.onDateSelected(date);
    }
  }

  _selectedDayOfWeek() {
    return this.props.date.getDay();
  }

  _renderWeekdays(weekdays: Array<Date>, selectedDate:Date) {
    const today = new Date();
    return weekdays.map(
      (d, ii) => (
        <TouchableWithoutFeedback
          key={`weekdays-${ii}`}
          onPress={() => this._onSelectDate(d)}
        >
          <View
            style={{
              alignSelf:'stretch',
              width:DateCellWidth,
              overflow:'visible',
              paddingBottom: 15,
              justifyContent:'flex-end',
              alignItems:'center',
              backgroundColor:'transparent',
            }}
          >
            <View
              style={[
                {
                  width:30,
                  height:30,
                  borderRadius:15,
                  backgroundColor:'#fe663b',
                  justifyContent:'center',
                  alignItems:'center',
                },
                this.constructor._isDateEqualByDay(d, selectedDate) ? null : {
                  backgroundColor:'transparent'
                }
              ]}
            >
              <Text
                style={[
                  { fontSize:14, lineHeight:20, color:'#2e3236', backgroundColor:'transparent' },
                  this.constructor._isFuture(d) ? this.constructor._futureDateTextStyle() : null,
                  this.constructor._isDateEqualByDay(d, selectedDate) ? { color:'white' } : null,
                ]}
              >
                {`${(this.constructor._isDateEqualByDay(d, today)  && this.props.textForToday) ? this.props.textForToday : d.getDate()}`}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      )
    );
  }

  render() {
    const weekdays = SimpleCalendar._lastCurrentNextWeekdays(this.state.weekOffset);
    return (
      <View
        style={[styles.container, this.props.style]}
      >
        <View
          style={[styles.datePage, { position:'absolute', left:0, top:0, right:0, paddingTop:13 }]}
        >
          {
            _.range(7).map(ii => SimpleCalendar._dayString(ii)).map(
              (dayString, ii) => (
                <TouchableWithoutFeedback
                  key={`weekday-names-${ii}`}
                  onPress={() => this._onSelectDate(this.state.currentWeekdays[ii])}
                >
                  <View
                    style={{
                      width: DateCellWidth,
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={[
                        { fontSize:12, lineHeight:17, color:'#8f9da5', },
                      ]}
                    >
                      {dayString}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            )
          }
        </View>
        <ScrollView
          ref={ref => (this.scrollView = ref)}
          style={[styles.scrollView, ]}
          scrollEventThrottle={16}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={this._onScrollEnd}
          overflow={'visible'}
          creditsContainerStyle={{ alignItems:'flex-end', }}
        >
          <View
            style={[styles.datePage, { alignItems:'flex-end' }]}
          >
            {
              this._renderWeekdays(weekdays.lastWeekdays, this.props.date)
            }
          </View>
          <View
            style={[styles.datePage, { alignItems:'flex-end', }]}
          >
            {
              this._renderWeekdays(weekdays.currentWeekdays, this.props.date)
            }
          </View>
          {
            this.state.weekOffset < 0 ?
              <View
                style={[styles.datePage, { alignItems:'flex-end' }]}
              >
                {
                this._renderWeekdays(weekdays.nextWeekdays, this.props.date)
              }
              </View>
            : null
          }
        </ScrollView>

      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    paddingTop: 10,
    height:83,
    overflow: 'hidden',
  },
  scrollView: {
    alignSelf: 'stretch',
    flex:1,
  },
  datePage: {
    justifyContent:'space-between',
    flexDirection:'row',
    width:ScreenWidth,
    paddingLeft:17,
    paddingRight:17,
  },
});
