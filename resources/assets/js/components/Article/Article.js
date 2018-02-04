import React, { Component } from 'react';
import { Table, Input, Button, Icon, Divider, message, Modal } from 'antd';
const ButtonGroup = Button.Group;
const confirm = Modal.confirm;
import { Link } from 'react-router-dom';
import styles from "./Article.css"

export class Article extends React.Component {
  constructor() {
    super();
    this.state = {
      //文章数据
      articles:[],
      articles_back:[],
      loading:true,
      //标题搜索
      filterDropdownVisible: false,
      searchText: '',
      filtered: false,
    };
  }
  componentWillMount() {
    this.fetchData()
  }
  fetchData(){
    var that = this
    //获取文章数据
    axios.get('z/articles')
    .then(function (response) {
      //console.log(response.data);
      that.setState({
        articles:response.data,
        articles_back:response.data,
        loading:false,
      })
    })
    .catch(function (error) {
      console.log(error);
    });
  }
  //标题搜索
  onInputChange = (e) => {
    this.setState({ searchText: e.target.value });
  }
  onSearch = () => {
    const { searchText } = this.state;
    const reg = new RegExp(searchText, 'gi');
    this.setState({
      filterDropdownVisible: false,
      filtered: !!searchText,
      articles: this.state.articles_back.map((record) => {
        const match = record.title.match(reg);
        if (!match) {
          return null;
        }
        return {
          ...record,
          title: (
            <span>
              {record.title.split(reg).map((text, i) => (
                i > 0 ? [<span className="highlight">{match[0]}</span>, text] : text
              ))}
            </span>
          ),
        };
      }).filter(record => !!record),
    });
  }
  handleDelete = (id) =>{
    var that = this
    confirm({
      title: '确认删除',
      content: '此操作将会永久删除此文章，确认继续？',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        //获取文章数据
        axios.get('z/articles/delete/' + id)
        .then(function (response) {
          if (response.status == 200) {
            that.fetchData()
            message.success(response.data.message)
          }
        })
        .catch(function (error) {
          console.log(error);
        });
      },
      onCancel() {
        console.log('取消删除');
      },
    });

  }
  render(){
    const columns = [{
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },{
      title: '标题',
      key: 'title',
      render: (text, record) => (
        <span>
            <Link to={'/articles/show/' + record.id}>
              {record.title}
            </Link>
        </span>
      ),
      filterDropdown: (
        <div className="custom-filter-dropdown">
          <Input
            ref={ele => this.searchInput = ele}
            placeholder="Search name"
            value={this.state.searchText}
            onChange={this.onInputChange}
            onPressEnter={this.onSearch}
          />
          <Button type="primary" onClick={this.onSearch}>搜索</Button>
        </div>
      ),
      filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
      filterDropdownVisible: this.state.filterDropdownVisible,
      onFilterDropdownVisibleChange: (visible) => {
        this.setState({
          filterDropdownVisible: visible,
        }, () => this.searchInput && this.searchInput.focus());
      },
    },{
      title: '内容',
      dataIndex: 'content',
      key: 'content',
    },{
      title: '发表时间',
      dataIndex: 'created_at',
      key: 'created_at',
    },{
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
    },{
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <span>
          <ButtonGroup>
            <Button icon="to-top"/>
            <Button icon="lock"/>
            <Button icon="delete" onClick={this.handleDelete.bind(this, record.id)}/>
          </ButtonGroup>
        </span>
      ),
    },];
    return (
      <div>
        <Link to={'/articles/create'}>
          <Button type="primary" icon="edit" style={{marginBottom:20}}>有事没事来一篇</Button>
        </Link>
        <Table size="middle" dataSource={this.state.articles} loading={this.state.loading} columns={columns} pagination={{ pageSize: 5 }}/>
      </div>
    )
  }
}
