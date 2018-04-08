/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    ActivityIndicator,
    Button,
    Image,
    ScrollView,
    Text,
    TextInput,
    TouchableHighlight,
    RefreshControl,
    TouchableOpacity,
    DeviceEventEmitter,
    View
} from 'react-native';
import {observer} from 'mobx-react';
import {action, autorun} from 'mobx';

import CartGoods from '../../mobx/cartGoods'
import CartComponent from './CartComponent'
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import ActiveButton from '../../components/common/ActiveButton';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import Toast, {DURATION} from 'react-native-easy-toast';

type Props = {};
@observer
export default class Cart extends Component<Props> {

    constructor(props) {
        super(props);
        this.state = {
            tradeType: 1,
            isRefreshing: false,
            isLoading: true,
        };
        this.data = new CartGoods()
    }

    static navigationOptions = ({navigation, screenProps}) => ({
        headerRight: (navigation.state.params && navigation.state.params.cartList.length > 0 &&
            <View style={styles.headerRightView}>
                <TouchableHighlight style={{marginRight: 10}} underlayColor='#f2f2f2'
                                    onPress={() => navigation.setParams({isEditing: !navigation.state.params.isEditing})}>
                    <View>
                        <Text>{navigation.state.params.isEditing ? '完成' : '编辑'}</Text>
                    </View>
                </TouchableHighlight>
            </View>)
    });


    componentDidMount() {
        this.fetchData()
    }

    render() {
        if (this.state.isLoading) {
            return <ActivityIndicator></ActivityIndicator>
        } else {
            let cartList = [];
            let data = this.data.itemData;
            if (data.data.length > 0) {
                cartList = <SwipeListView
                    useFlatList
                    rightOpenValue={-60}
                    data={data.data}
                    disableRightSwipe={true}
                    stopRightSwipe={-150}
                    previewRowKey={'12adf'}
                    closeOnRowBeginSwipe={true}
                    closeOnRowPress={true}
                    closeOnScroll={true}
                    keyExtractor={(item) => item.goodsSkuId}
                    renderHiddenItem={(rowData, rowMap) => (
                        <View style={styles.rowBack}>
                            <TouchableOpacity
                                onPress={_ => {
                                    this.closeRow(rowMap, rowData.item.goodsSkuId);
                                    this.deleteGoods(rowData.item.goodsSkuId)
                                }}>
                                <View style={styles.deleteGoodsView}>
                                    <Text style={styles.deleteGoods}>删除</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                    )}
                    renderItem={(data, rowMap) => (
                        <CartComponent {...this.props} itemData={data.item} data={this.data}></CartComponent>
                    )}>
                </SwipeListView>;
            } else {
                cartList = <View style={styles.noGoodsView}>
                    <Image
                        style={styles.noGoodsImg}
                        source={require('../../images/cart.png')}
                        resizeMode='contain'
                    />
                    <Text style={styles.cartTextTop}>进货单空空如也～</Text>
                    <Text style={styles.cartTextNext}>最热门的商品正在等着您呢</Text>
                    <ActiveButton clickBtn={() => this.backToHome()} text='逛一逛'
                                  style={styles.activeButton}></ActiveButton>
                </View>
            }

            return (
                <View style={styles.container}>
                    {/*<RefreshControl*/}
                    {/*refreshing={this.state.isRefreshing}*/}
                    {/*onRefresh={this._onRefresh.bind(this)}*/}
                    {/*title="加载中..."*/}
                    {/*progressBackgroundColor="#ffff00">*/}

                    {/*</RefreshControl>*/}
                    <View style={styles.tabView}>
                        <TouchableHighlight
                            onPress={() => this.changeTab(1)}
                            underlayColor='#fff'>
                            <View style={styles.singleTab}>
                                <Text
                                    style={this.state.tradeType === 1 ? styles.activeTab : styles.negativeTab}>一般贸易</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                            onPress={() => this.changeTab(2)}
                            underlayColor='#fff'>
                            <View style={styles.singleTab}>
                                <Text
                                    style={this.state.tradeType === 2 ? styles.activeTab : styles.negativeTab}>保税区发货</Text>
                            </View>
                        </TouchableHighlight>
                        <TouchableHighlight
                            onPress={() => this.changeTab(3)}
                            underlayColor='#fff'>
                            <View style={styles.singleTab}>
                                <Text
                                    style={this.state.tradeType === 3 ? styles.activeTab : styles.negativeTab}>海外直邮</Text>
                            </View>
                        </TouchableHighlight>
                    </View>
                    {cartList}
                    {
                        data.data.length > 0 &&
                        <View style={styles.cartTotalView}>
                            <View style={styles.cartTotalLeftView}>
                                <TouchableOpacity onPress={() => this.allSelect()}>
                                    {
                                        this.data.isAllSelect ?
                                            (<Icon name="check-circle" size={20} color={activeColor}></Icon>) :
                                            (<Icon2 name="checkbox-blank-circle-outline" size={20}></Icon2>)
                                    }
                                </TouchableOpacity>

                                <Text style={{marginLeft: 5}}>全选</Text>
                                <Text style={{marginLeft: 5}}>合计：¥{this.data.totalMoney1}</Text>
                            </View>
                            <View style={styles.cartTotalRightView}>
                                <ActiveButton
                                    text={`去结算(${this.data.totalNumber})`}
                                    style={styles.accountsBtn}
                                    textStyle={styles.accountsBtnText}
                                    clickBtn={() => {
                                        this.confirmOrder()
                                    }}>

                                </ActiveButton>
                            </View>
                        </View>
                    }
                    <Toast ref='toast' position='center'></Toast>
                </View>
            );
        }
    }

    _onRefresh() {
        this.setState({isRefreshing: true});
        this.fetchData();
    }

    closeRow(rowMap, rowKey) {
        if (rowMap[rowKey]) {
            rowMap[rowKey].closeRow();
        }
    }

    confirmOrder() {
        //生成订单
        let cartList = this.state.cartList;
        let arr = [];
        cartList.filter(value => value.itemSelect === 1).map(value => {
            arr.push(value)
        });
        if (arr.length === 0) {
            this.refs.toast.show("您还没有选择商品哦", 500);
            return;
        }
        if (this.state.tradeType === 1) {
            this.props.navigation.navigate('ConfirmOrder', {cartList: arr});
        } else {
            this.props.navigation.navigate('ConfirmCrossOrder', {cartList: arr});
        }
    }

    deleteGoods(id) {//删掉购物车中某个商品
        let params = {deleteGoodsSkuIds: [id]};
        HttpUtils.post('/shoppingCart/deleteShoppingCartItem', params, data => {
            this.fetchData();
        })
    }

    toGoodsDetail(id) {
        this.props.navigation.navigate('GoodsDetail', {id: id});
    }

    changeTab(index) {
        this.state.tradeType = index;
        this.fetchData();
    }

    backToHome() {
        this.props.navigation.navigate('Home')
    }

    fetchData() {
        let params = {
            tradeType: this.state.tradeType
        };
        HttpUtils.get('/shoppingCart/viewShoppingCart', params, data => {
            let cartList = data.data;
            let totalMoney = 0;
            let totalNum = 0;
            let isAllSelect = true;

            cartList.map(value => {
                let sku = JSON.parse(value.goodsSku);
                let skuStr = "";
                for (let key in sku) {
                    skuStr += `${key}:${sku[key]},`;
                }
                skuStr = skuStr.substr(0, skuStr.length - 1);
                value.sku = skuStr;
                if (value.itemSelect === 1) {
                    let emsPrice = value.emsPrice || 0;
                    totalMoney += value.putPrice * value.number + parseInt(emsPrice);
                    totalNum += value.number;
                } else {
                    isAllSelect = false;
                }
            });
            this.data.replace({data: cartList, isAllSelect: isAllSelect, totalMoney: totalMoney, totalNum: totalNum});
            this.setState({isLoading: false, isRefreshing: false});
            this.props.navigation.setParams({isEditing: false, cartList: cartList});

            console.warn(this.data)
        })
    }

    @action
    allSelect() {
        // DeviceEventEmitter.emit('allSelect', !this.data.itemData.isAllSelect);
        this.data.isAllSelect = !this.data.isAllSelect;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    cartTotalView: {
        position: 'absolute',
        bottom: 0,
        width: screenWidth,
        height: 46,
        backgroundColor: whiteColor,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cartTotalLeftView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10
    },
    cartTotalRightView: {},
    accountsBtn: {
        backgroundColor: activeColor,
        alignItems: 'center',
        width: screenWidth * 0.3,
        height: 46,
        justifyContent: 'center'
    },
    accountsBtnText: {
        fontSize: 16,
        color: whiteColor
    },
    rowBack: {
        width: screenWidth,
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    deleteGoodsView: {
        backgroundColor: activeColor,
        width: 60,
        height: screenWidth * 0.25 + 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteGoods: {
        color: whiteColor
    },
    tabView: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        width: screenWidth,
        backgroundColor: whiteColor,
        borderBottomWidth: 1,
        borderBottomColor: borderColor
    },
    singleTab: {
        width: screenWidth / 3,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    activeTab: {
        color: activeColor
    },
    negativeTab: {
        color: '#444'
    },
    noGoodsView: {
        alignItems: 'center',
        backgroundColor: whiteColor,
        width: screenWidth,
        paddingBottom: 10
    },
    noGoodsImg: {
        width: screenWidth * 0.6,
        height: screenWidth * 0.6 * 322 / 524,
        marginTop: 30
    },
    cartTextTop: {
        marginTop: 30,
        fontSize: 14
    },
    cartTextNext: {
        marginTop: 10,
        fontSize: 12
    },
    activeButton: {
        backgroundColor: activeColor,
        marginTop: 10,
        alignItems: 'center',
        padding: 10,
        borderRadius: 5
    },
});