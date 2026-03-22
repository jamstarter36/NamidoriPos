const handleCheckout = (subtotal, vatRate, vatAmount, total, member, discount = 0) => {
    if (!cart.length) return;
    setPayAnim(true);
    setTimeout(async () => {
      try {
        // Update stock for non-free items
        const stockUpdates = cart
          .filter((c) => !c.isFree)
          .map((c) => updateStock(c.originalId || c.id, Math.max(0, c.stock - c.qty)));

        // Save order — backend will handle stamp update & reset
        const order = {
          items: cart,
          subtotal,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          total,
          discount,
          member_id: member ? member.id : null,
          member_name: member ? member.full_name : "Walk-in",
        };

        await Promise.all([...stockUpdates, saveOrder(order)]);

        getProducts().then((res) => setItems(res.data));
        setCart([]);
        setPaid(true);
        setPayAnim(false);
        setCheckoutKey((k) => k + 1);
        setTimeout(() => setPaid(false), 2200);
      } catch (err) {
        console.error("Checkout failed:", err);
        setPayAnim(false);
      }
    }, 900);
  };