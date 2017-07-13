pragma solidity ^0.4.11;

// Cost estimations as of July 4th 2017:
// Creation: 4USD
// Purchase of 1 ticket: 0.88 USD

/** @title Simple Ticket.*/
contract SimpleTicket{
    address private owner;
    uint public totalTickets;
    uint public totalTicketsSold;
    uint public ticketPrice;
    uint private totalRevenue;
    string public standard = "TICKETINGPOC-0.1";
    mapping(uint => address) public seatsToAttendees;
    mapping(address => uint) public attendeesToSeats;

    event TicketPurchasedEvent(address indexed _attendee, uint _amount);

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function SimpleTicket(uint inTotalTickets, uint inTicketPrice){
        owner = msg.sender;
        totalRevenue = 0;
        totalTicketsSold = 0;
        totalTickets = inTotalTickets;
        ticketPrice = inTicketPrice;
    }

    /** @dev Returns the number of unconsumed tickets per user
    *
    */
    function getUserTicketCount() public constant returns (uint){
      return attendeesToSeats[msg.sender];
    }

    /**@dev Purchases tickets for the event
    * @param amount Number of tickets to purchase.
    */
    function purchaseTicket(uint amount) public payable returns (bool){
        uint transactionTotal = amount * ticketPrice;
        // verify: (1) tickets left, (2) amount is >0, (3) user has the money
        if((amount + totalTicketsSold <= totalTickets) && (amount > 0) && (msg.value>transactionTotal)){

        // track the total revenue
        totalRevenue += transactionTotal;
        // send it to owner account
        for (uint i = totalTicketsSold + 1; i < totalTicketsSold + amount + 1; i++) {
            seatsToAttendees[i] = msg.sender;
        }
        attendeesToSeats[msg.sender] += amount;
        totalTicketsSold += amount;
        TicketPurchasedEvent(msg.sender, amount);
        return true;
        } else{
            return false;
        }
  }

    function withdrawAll() onlyOwner payable returns (bool){
          uint amount = totalRevenue;
          // Remember to zero the pending refund before
          // sending to prevent re-entrancy attacks
          totalRevenue = 0;
          msg.sender.transfer(amount);
    }
}
