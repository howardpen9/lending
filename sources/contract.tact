message(0x05138d91) OwnershipAssigned{
    query_id: Int as uint64;
    prev_owner: Address;
    forward_payload: Slice as remaining; 
}

message(0xd53276db) Excesses {
    query_id: Int as uint64;
}

message(0x5fcc3d14) Transfer { 
    query_id: Int as uint64;            
    new_owner: Address; 
    response_destination: Address; 
    custom_payload: Cell?; 
    forward_amount: Int as coins; 
    forward_payload: Slice as remaining; 
}

message Admin_Deposit {
    nft_item_address: Address;
}

message Admin_Withdraw {
    nft_item_address: Address;
}

contract lending_record {
    owner: Address;
    record: map<Address, Address>;

    init(owner: Address) {
        self.owner = owner;
    }

    receive(msg: OwnershipAssigned) {
        let ctx: Context = context();
        if (msg.prev_owner == self.owner) { 
            let orginal_owner: Address? = self.record.get(ctx.sender);
            if (orginal_owner == null) { 
                // TODO
                // Do nothing
            }
            self.record.set(ctx.sender, null);
            send(SendParameters{
                to: ctx.sender,
                value: 0, 
                bounce: false,
                mode: SendIgnoreErrors + SendRemainingValue,
                body: Transfer {
                    query_id: 0,
                    new_owner: orginal_owner!!,
                    response_destination: myAddress(),
                    custom_payload: emptyCell(),
                    forward_amount: ton("0.000000001"),
                    forward_payload: emptySlice()
                }.toCell()
            });
        } else {
            self.record.set(ctx.sender, msg.prev_owner); // [NFT Item Address] -> [Original Owner]
            send(SendParameters{
                to: ctx.sender,
                value: 0, 
                bounce: false,
                mode: SendIgnoreErrors + SendRemainingValue,
                body: Transfer {
                    query_id: 0,
                    new_owner: self.owner,
                    response_destination: myAddress(),
                    custom_payload: emptyCell(),
                    forward_amount: ton("0.03"),
                    forward_payload: emptySlice()
                }.toCell()
            });
        }
    }

    receive(msg: Excesses) {
        send(SendParameters{value: 0, to: self.owner, mode: SendRemainingValue + SendIgnoreErrors});
    }
}