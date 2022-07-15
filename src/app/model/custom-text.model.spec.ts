import { CustomText, CustomTextType } from './custom-text.model';

describe('CustomerText', () => {
  it('should recognize title', () => {
    const item = new CustomText('[%title%]DISCLAIMER');
    expect(item.type).toBe(CustomTextType.Title);
    expect(item.leftBlock).toBe('DISCLAIMER');
    expect(item.rightBlock).toBe('');
    expect(item.keyBlock).toBe('');
  });

  it('should recognize plain text with a product name', () => {
    const item = new CustomText('Please note that you are about to transfer funds using [%product%] services');
    expect(item.type).toBe(CustomTextType.Text);
    expect(item.leftBlock).toBe('Please note that you are about to transfer funds using Horns services');
    expect(item.rightBlock).toBe('');
    expect(item.keyBlock).toBe('');
  });
  
  it('should recognize plain text', () => {
    const item = new CustomText('Dear Customer');
    expect(item.type).toBe(CustomTextType.Text);
    expect(item.leftBlock).toBe('Dear Customer');
    expect(item.rightBlock).toBe('');
    expect(item.keyBlock).toBe('');
  });
  
  it('should recognize paragraph', () => {
    const item = new CustomText('[%paragraph%]');
    expect(item.type).toBe(CustomTextType.Paragraph);
    expect(item.leftBlock).toBe('');
    expect(item.rightBlock).toBe('');
    expect(item.keyBlock).toBe('');
  });
  
  it('should recognize plain text and the term link', () => {
    const item = new CustomText('Before using our services we do recommend you to read our <%terms%>Terms and Conditions</%terms%> Policy');
    expect(item.type).toBe(CustomTextType.Terms);
    expect(item.leftBlock).toBe('Before using our services we do recommend you to read our ');
    expect(item.rightBlock).toBe(' Policy');
    expect(item.keyBlock).toBe('Terms and Conditions');
  });
  
  it('should recognize check box', () => {
    const item = new CustomText('[%accept%]I have read and accept the terms and conditions of [%product%], cookies policy and disclaimer');
    expect(item.type).toBe(CustomTextType.Accept);
    expect(item.leftBlock).toBe('');
    expect(item.rightBlock).toBe('');
    expect(item.keyBlock).toBe('I have read and accept the terms and conditions of Horns, cookies policy and disclaimer');
  });
});
