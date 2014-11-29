/** @jsx React.DOM */
var _ = require('lodash');
var React = require('react/addons');
var Cell = require('./Cell.react');
var Timer = require('./Timer.react');
var CellActionCreators = require('../actions/CellActionCreators');
var BoardActionCreators = require('../actions/BoardActionCreators');
var MinesweeperStore = require('../stores/MinesweeperStore');

var Board = React.createClass({
  getInitialState: function() {
    return {
      rows: this.props.rows,
      isLost: this.props.isLost,
      isWon: this.props.isWon
    };
  },
  componentDidMount: function() {
    MinesweeperStore.addChangeListener(this._onChange, this);
  },
  render: function() {
    var classes = React.addons.classSet({
      'game-lost': this.state.isLost,
      'game-won': this.state.isWon
    });
    var storeState = MinesweeperStore.getState();
    var isRunning = !storeState.isLost && !storeState.isWon && !storeState.isFreshBoard;
    var cells = _.flatten(this.state.rows);
    var totalBombs = _.filter(cells, function(c) { return c.isBomb }).length;
    var totalFlags = _.filter(cells, function(c) { return c.isFlagged }).length;
    return (
      <div>
        <div id='inline-elements'>
          <span className="bombs-remaining digital">{totalBombs - totalFlags}</span>
          <h3 onClick={this.reset} className={classes}>Sweeper</h3>
          <Timer isRunning={isRunning} />
        </div>
        <table>
          <tbody>
            {this.getRows()}
          </tbody>
        </table>
      </div>
    );
  },
  getRows: function() {
    var me = this;
    return _.map(this.state.rows, function(row) {
      return (
        <tr>
          {me.getCells(row)}
        </tr>
      );
    })
  },
  getCells: function(row) {
    var me = this;
    return _.map(row, function(cellInfo) {
      return me.getCellComponent(cellInfo);
    });
  },
  getCellComponent: function(info) {
    return <Cell isBomb={info.isBomb}
                 isClicked={info.isClicked}
                 isFlagged={info.isFlagged}
                 bombCount={info.bombCount}
                 location={info.location}
                 onRightClick={this.cellRightClicked}
                 onOpen={this.cellClicked} />;
  },
  _onChange: function() {
    var state = MinesweeperStore.getState()
    this.setState({
      rows: state.rows,
      isLost: state.isLost,
      isWon: state.isWon
    }, function() {
      var board = this.getDOMNode().parentNode;
      board.style.width = (this.state.rows.length * 31 + 1).toString() + "px";
    });
  },
  cellClicked: function(location) {
    CellActionCreators.receiveClick(location);
  },
  cellRightClicked: function(location) {
    CellActionCreators.receiveRightClick(location);
  },
  reset: function() {
    BoardActionCreators.receiveReset(this.state.rows.length);
  }
});

module.exports = Board;
