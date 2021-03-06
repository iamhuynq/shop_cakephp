$(function () {
	var start = moment().subtract(29, 'days');
	var end = moment();
	var globalStart;
	var globalEnd;
    function cb(start, end) {
		$('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
		$('#exportBtn').attr({
			'data-start': start.format('YYYY-MM-DD'),
			'data-end': end.format('YYYY-MM-DD')
		});
		globalStart = start;
		globalEnd = end;
	}

	$("#getTable").click(function(){
		var clone_start = globalStart.clone();
		var result = [moment({...clone_start})];

		while(globalEnd.date() != clone_start.date()){
			clone_start.add(1, 'day');
			result.push(moment({ ...clone_start }));
		}
		$.ajax({
			url: location.protocol + "//" + document.domain + "/admin/getReport",
			type: 'POST',
			data: {
				start:	globalStart.format('YYYY-MM-DD'),
				end: globalEnd.format('YYYY-MM-DD'),
				type: $("#typeReport").val(),
			},
		})
			.done(function (response) {
				const res = JSON.parse(response);
				$('#bodyTable').empty();
				$('#footerTable').empty();
				$('#headerTable').empty();
				if($("#typeReport").val() == 1){
					const arr = result.map(x => ({
						date: x.format("YYYY-MM-DD"),
						total: getTotal(x, res),
					}))
					var total = 0;
					const tr_head = $('<tr>').appendTo($('#headerTable'));
					$('<th>').attr({
						width: '20%',
						scope: 'col'
					}).text('STT').appendTo($(tr_head));
					$('<th>').attr({
						width: '40%',
						scope: 'col'
					}).text('Date').appendTo($(tr_head));
					$('<th>').attr({
						width: '40%',
						scope: 'col'
					}).text('Price').appendTo($(tr_head));
					for(i = 0; i < arr.length; i++){
						const tr = $('<tr>').appendTo($('#bodyTable'));
						const th = $('<th>').attr('scope', 'row').text(i+1).appendTo($(tr));
						const td = $('<td>').text(arr[i]['date']).appendTo($(tr));
						const td2 = $('<td>').text(arr[i]['total']).appendTo($(tr));
						total += parseInt(arr[i]['total']);
					}
					const tr2 = $('<tr>').appendTo($('#footerTable'));
					const td3 = $('<td>').css({
						'text-align': 'center',
					}).attr('colspan', 2).text('Total').appendTo($(tr2));
					const td4 = $('<td>').text(total+'d').appendTo($(tr2));
				}else{
					const tr_head = $('<tr>').appendTo($('#headerTable'));
					$('<th>').attr({
						width: '20%',
						scope: 'col'
					}).text('STT').appendTo($(tr_head));
					$('<th>').attr({
						width: '40%',
						scope: 'col'
					}).text('Sản phẩm').appendTo($(tr_head));
					$('<th>').attr({
						width: '40%',
						scope: 'col'
					}).text('Số lượng').appendTo($(tr_head));
					if(res.length){
						for(i = 0; i < res.length; i++){
							const tr = $('<tr>').appendTo($('#bodyTable'));
							const th = $('<th>').attr('scope', 'row').text(i+1).appendTo($(tr));
							const td = $('<td>').text(res[i]['products']['name']).appendTo($(tr));
							const td2 = $('<td>').text(res[i]['0']['total']).appendTo($(tr));
						}
					}else{
						var no_tr = $('<tr>').appendTo($('#bodyTable'));
						$('<td>').css({
							'text-align': 'center',
						}).attr('colspan', 3).text('Have no data').appendTo($(no_tr));
					}
				}
				$('#dataTable2').destroy();
				$('#dataTable2').dataTable({
					"pageLength": 30
				});

			})
			.fail(function () {
				console.log("error");
			})
			.always(function () {
				console.log("complete");
			});
	})

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

	cb(start, end);
	$('#exportBtn').click(function(){
		window.location.replace(location.protocol + "//" + document.domain + "/users/contact?start=" + $(this).attr('data-start')
			+ '&end=' + $(this).attr('data-end') + '&type=' + $("#typeReport").val()
		);
	});
	if ($("body").find($('#test_ck')).length > 0) {
		CKEDITOR.replace('ckedit');
	}
	$('.add_genre').click(function (event) {
		$.ajax({
			url: location.protocol + "//" + document.domain + "/admin/addGenre",
			type: 'POST',
			data: {
				name: $(this).prev().prev().val(),
				id_cate: $(this).prev().val()
			},
		})
			.done(function (res) {
				location.reload();
			})
			.fail(function () {
				console.log("error");
			})
			.always(function () {
				console.log("complete");
			});

	});

	$('.add_manage').click(function (event) {
		if ($('.pass_manage_1').val() != $('.pass_manage_2').val()) {
			$.toast({
				heading: 'Error',
				text: 'Password not right',
				icon: 'error',
				position: 'bottom-right',
				loader: false
			});
		} else {
			$.ajax({
				url: 'addManage',
				type: 'POST',
				data: {
					name: $('.name_manage').val(),
					phone: $('.phone_manage').val(),
					mail: $('.mail_manage').val(),
					id_store: $('.store_manage').val(),
					pass: $('.pass_manage_1').val()
				}
			})
				.done(function (res) {
					location.reload();
				})
				.fail(function () {
					console.log("error");
				});
		}
	});
	$('.login_admin_btn').click(function (event) {
		$.ajax({
			url: 'checkLogin',
			type: 'POST',
			data: {
				mail: $('#mail_login_admin').val(),
				pass: $('#pass_login_admin').val()
			}
		})
			.done(function (res) {
				res = $.parseJSON(res);
				if (res == 'error') {
					$.toast({
						heading: 'Error',
						text: 'Email or password is wrong!',
						icon: 'error',
						position: 'bottom-right',
						loader: false
					});
				} else {
					window.location = "index";
				}
			})
			.fail(function () {
				console.log("error");
			});
	});

	$('.cancel_order').click(function (event) {
		$.ajax({
			url: '../cancelOrder',
			type: 'POST',
			data: {
				id_invoice: $(this).attr('data-id'),
				id_store: $(this).attr('data-store')
			}
		})
			.done(function (res) {
				console.log(res);
				if(res == 'false'){
					$.toast({
						heading: 'Success',
						text: 'Something wrong',
						icon: 'success',
						position: 'bottom-right',
						loader: false
					});
					setTimeout(function () {
						window.location = "../../admin/onlinebill";
					}, 2000);
				}else{
					$.toast({
						heading: 'Success',
						text: 'Cancel success',
						icon: 'success',
						position: 'bottom-right',
						loader: false
					});
					setTimeout(function () {
						window.location = "../../admin/onlinebill";
					}, 2000);
				}

			});
	});
	$('.cancel_invoice').click(function (event) {
		$.ajax({
			url: '../cancelInvoice',
			type: 'POST',
			data: {
				id_invoice: $(this).attr('data-id'),
				id_store: $(this).attr('data-store')
			}
		})
			.done(function (res) {
				if(res == 'false'){
					$.toast({
						heading: 'Error',
						text: 'Something wrong, please check',
						icon: 'error',
						position: 'bottom-right',
						loader: false
					});
					setTimeout(function () {
						window.location = "../exports";
					}, 3000);
				}else{
					$.toast({
						heading: 'Success',
						text: 'Cancel success',
						icon: 'success',
						position: 'bottom-right',
						loader: false
					});
					setTimeout(function () {
						window.location = "../exports";
					}, 3000);
				}
			});
	});
	$('.confirm_order').click(function (event) {
		$.ajax({
			url: '/Invoices/confirmOrder',
			type: 'POST',
			data: {
				id_invoice: $(this).attr('data-id')
			}
		})
			.done(function (res) {
				$.toast({
					heading: 'Success',
					text: 'Confirm success',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
				setTimeout(function () {
					window.location = "../../admins/onlinebill";
				}, 1500);
			});
	});
	$('.confirm_invoice').click(function (event) {
		$(this).hide();
		$(this).next().removeClass('d-none');
		$.ajax({
			url: '../confirmInvoice',
			type: 'POST',
			data: {
				id_invoice: $(this).attr('data-id'),
				id_store: $(this).attr('data-store')
			}
		})
			.done(function (res) {
				$.toast({
					heading: 'Success',
					text: 'Confirm success',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
				setTimeout(function () {
					window.location = "../imports";
				}, 3000);
			});
	});
	$('.edit_new').click(function (event) {
		$(this).parent().prev().children('span').hide();
		$(this).parent().prev().children('input').removeClass('d-none');
		$(this).hide();
		$(this).next().removeClass('d-none');
	});
	$('.edit_img_new').click(function (event) {
		$(this).hide();
		$(this).next().removeClass('d-none');
		$(this).parent().prev().children('img').hide();
		$(this).parent().prev().children('input').removeClass('d-none');
	});
	$('.submit_edit_img_new').click(function (event) {
		if (!$('#image_edit_new').val()) {
			$(this).addClass('d-none');
			$(this).prev().show();
			$(this).parent().prev().children('img').show();
			$(this).parent().prev().children('input').addClass('d-none');
			$.toast({
				heading: 'Error',
				text: 'Nothing has changed!',
				icon: 'error',
				position: 'bottom-right',
				loader: false
			});
		} else {
			var file = $('#image_edit_new')[0].files[0];
			var formData = new FormData();
			formData.append('img', file);
			formData.append('id', $(this).attr('data-id'));
			$.ajax({
				url: '../editImgNew',
				type: 'POST',
				processData: false,
				contentType: false,
				data: formData
			})
				.done(function (res) {
				})
				.fail(function () {
					console.log("error");
				});
			location.reload();
		}
	});
	$('.new_bill').click(function (event) {
		var id_send = $(this).prev().val();
		var datastring = $("#form_product").serializeArray();
		$.ajax({
			url: location.protocol + "//" + document.domain + "/admins/addBill",
			type: 'POST',
			data: {
				id_sent: id_send,
				id_receive: $('#customer_id').val(),
				date: $('.date_bill').val(),
				dataform: datastring
			}
		})
			.done(function (res) {
				location.reload();
			})
			.fail(function () {
				console.log("error");
			});
	});
	$('#submit_edit_content_new').click(function (event) {
		console.log(CKEDITOR.instances['id_txt_edit_content'].getData());
		$.ajax({
			url: '../editContentNew',
			type: 'POST',
			data: {
				content: CKEDITOR.instances['id_txt_edit_content'].getData(),
				id: $(this).attr('data-id')
			}
		})
			.done(function (res) {
			})
			.fail(function () {
				console.log("error");
			});
		location.reload();
	});
	$('.submit_edit_date_new').click(function (event) {
		$(this).addClass('d-none');
		$(this).prev().show();
		$(this).parent().prev().children('span').text($(this).parent().prev().children('input').val()).show();
		$(this).parent().prev().children('input').addClass('d-none');
		$.ajax({
			url: '../editDate',
			type: 'POST',
			data: { date: $(this).parent().prev().children('input').val(), id: $(this).attr('data-id') },
		})
			.done(function () {
				console.log("success");
			})
			.fail(function () {
				console.log("error");
			});
	});
	$('.submit_edit_short_content_new').click(function (event) {
		$(this).addClass('d-none');
		$(this).prev().show();
		$(this).parent().prev().children('span').text($(this).parent().prev().children('input').val()).show();
		$(this).parent().prev().children('input').addClass('d-none');
		$.ajax({
			url: '../editShortContent',
			type: 'POST',
			data: { short_content: $(this).parent().prev().children('input').val(), id: $(this).attr('data-id') },
		})
			.done(function () {
				console.log("success");
			})
			.fail(function () {
				console.log("error");
			});
	});
	$('.submit_edit_title_new').click(function (event) {
		$(this).addClass('d-none');
		$(this).prev().show();
		$(this).parent().prev().children('span').text($(this).parent().prev().children('input').val()).show();
		$(this).parent().prev().children('input').addClass('d-none');
		$.ajax({
			url: '../editTitle',
			type: 'POST',
			data: { title: $(this).parent().prev().children('input').val(), id: $(this).attr('data-id') },
		})
			.done(function () {
				console.log("success");
			})
			.fail(function () {
				console.log("error");
			});
	});
	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
		$(this).toggleClass('active');
	});

})
function edit_store(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('input').removeClass('d-none');
}
function edit_url_store(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('input').removeClass('d-none');
}
function edit_lat_store(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('input').removeClass('d-none');
}

function submit_edit_name_store(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val()).show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: '../editNameStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			name: obj.parent().prev().children('input').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_lng_store(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val()).show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: '../editLngStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			lng: obj.parent().prev().children('input').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_lat_store(obj) {
	console.log(obj.parent().prev().children('input').val());
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val()).show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: '../editLatStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			lat: obj.parent().prev().children('input').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_image_store(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('textarea').val()).show();
	obj.parent().prev().children('textarea').addClass('d-none');
	$.ajax({
		url: '../editImgStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			image: obj.parent().prev().children('textarea').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_addr_store(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val()).show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: '../editAddrStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			address: obj.parent().prev().children('input').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_phone_store(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val()).show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: '../editPhoneStore',
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			phone: obj.parent().prev().children('input').val()
		}
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
}
function edit_btn(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().prev().children('span').hide();
	obj.parent().prev().prev().children('input').removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('select').removeClass('d-none');
	// obj.parent().prev().prev().children('input').removeClass('d-none');
}
function edit_cate_btn(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('input').removeClass('d-none');
}
function submit_edit_cate(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val());
	obj.parent().prev().children('span').show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: location.protocol + "//" + document.domain + "/admins/editCate",
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			category: obj.parent().prev().children('input').val()
		}
	})
		.done(function (res) {
		})
		.fail(function () {
			console.log("error");
		});
}

function addNew() {
	if (!$('#imageNew').val()) {
		$.toast({
			heading: 'Error',
			text: 'Please choose image!',
			icon: 'error',
			position: 'bottom-right',
			loader: false
		});
	} else {
		var file = $('#imageNew')[0].files[0];
	}
	var formData = new FormData();
	formData.append('title', $('#staticTitle').val());
	formData.append('date', $('#staticDate').val());
	formData.append('content', CKEDITOR.instances['test_ck'].getData());
	formData.append('image', file);
	$.ajax({
		url: location.protocol + "//" + document.domain + "/news/addNew",
		type: 'POST',
		processData: false,
		contentType: false,
		data: formData
	})
		.done(function (res) {
		})
		.fail(function () {
			console.log("error");
		});
}
function edit_genre_btn(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('input').removeClass('d-none');
}
function edit_btn_result(obj) {
	obj.hide();
	obj.next().removeClass('d-none');
	obj.parent().prev().children('span').hide();
	obj.parent().prev().children('select').removeClass('d-none');
	obj.parent().prev().prev().children('span').hide();
	obj.parent().prev().prev().children('input').removeClass('d-none');
}
function submit_edit_result(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('input').val());
	obj.parent().prev().children('span').show();
	obj.parent().prev().children('input').addClass('d-none');
	$.ajax({
		url: location.protocol + "//" + document.domain + "/events/editEvent",
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			content: obj.parent().prev().children('input').val()
		}
	})
		.done(function (res) {
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_result_edit(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().children('span').text(obj.parent().prev().children('select').val()).show();
	obj.parent().prev().children('select').addClass('d-none');
	obj.parent().prev().prev().children('span').text(obj.parent().prev().prev().children('input').val()).show();
	obj.parent().prev().prev().children('input').addClass('d-none');
	$.ajax({
		url: location.protocol + "//" + document.domain + "/events/editResult",
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			content: obj.parent().prev().prev().children('input').val(),
			type: obj.parent().prev().children('select').val()
		}
	})
		.done(function (res) {
			res = $.parseJSON(res);
			console.log(res);
		})
		.fail(function () {
			console.log("error");
		});
}
function submit_edit_question(obj) {
	obj.addClass('d-none');
	obj.prev().show();
	obj.parent().prev().prev().children('span').text(obj.parent().prev().prev().children('input').val()).show();
	obj.parent().prev().prev().children('input').addClass('d-none');
	obj.parent().prev().children('span').text(obj.parent().prev().children('select').val()).show();
	obj.parent().prev().children('select').addClass('d-none');
	$.ajax({
		url: location.protocol + "//" + document.domain + "/questions/editQuestion",
		type: 'POST',
		data: {
			id: obj.attr('data-id'),
			content: obj.parent().prev().prev().children('input').val(),
			type: obj.parent().prev().children('select').val()
		}
	})
		.done(function (res) {
		})
		.fail(function () {
			console.log("error");
		});
}
function delete_question(obj) {
	if (confirm('Are you sure?')) {
		$.ajax({
			url: location.protocol + "//" + document.domain + "/questions/deleteQuestion/" + obj.attr('data-id'),

		})
			.done(function (res) {
				obj.parent().parent().remove();
				$.toast({
					heading: 'Success',
					text: 'Delete successful!',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
			})
			.fail(function () {
				console.log("error");
			});
	}
}
function delete_event(obj) {
	console.log('as');
	if (confirm('Are you sure?')) {
		$.ajax({
			url: location.protocol + "//" + document.domain + "/events/deleteEvent/" + obj.attr('data-id'),

		})
			.done(function (res) {
				obj.parent().parent().remove();
				$.toast({
					heading: 'Success',
					text: 'Delete successful!',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
			})
			.fail(function () {
				console.log("error");
			});
	}
}
function add_event(obj) {
	$.ajax({
		url: location.protocol + "//" + document.domain + "/events/addEvent",
		type: 'POST',
		data: {
			type: obj.attr('data-id'),
			content: obj.prev().val()
		}
	})
		.done(function (res) {
			obj.prev().val('');
			console.log(obj.attr('data-id'));
			res = $.parseJSON(res);
			var table = obj.parent().prev().children('tbody');
			var tr = $('<tr>').appendTo($(table));
			var th = $('<th>').attr('scope', 'row').text('F' + res['id']).appendTo($(tr));
			var td = $('<td>').appendTo($(tr));
			var span = $('<span>').addClass('content').text(res['content']).appendTo($(td));
			var input = $('<input>').css('max-width', '100%').attr({
				type: 'text',
				class: 'col-sm-3 form-control d-none',
				value: res['content']
			}).appendTo($(td));
			var td2 = $('<td>').appendTo($(tr));
			var a = $('<a>').addClass('edit').attr('onclick', 'edit_btn($(this))').appendTo($(td2));
			var i = $('<i>').addClass('fas fa-edit').appendTo($(a));
			var a2 = $('<a>').attr({
				class: 'submit_edit_event d-none',
				'data-id': res['id'],
				onclick: 'submit_edit_result($(this))'
			}).appendTo($(td2));
			var i2 = $('<i>').addClass('fas fa-check').appendTo($(a2));
			var td3 = $('<td>').appendTo($(tr));
			var i3 = $('<i>').addClass('fas fa-trash-alt').attr({
				'data-id': res['id'],
				onclick: 'delete_event($(this))'
			}).appendTo($(td3));
		})
		.fail(function () {
			console.log("error");
		});
}
function delete_rule(obj) {
	if (confirm('Are you sure?')) {
		$.ajax({
			url: location.protocol + "//" + document.domain + "/rules/deleteRule/" + obj.attr('id'),

		})
			.done(function (res) {
				obj.parent().parent().remove();
				$.toast({
					heading: 'Success',
					text: 'Delete successful!',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
			})
			.fail(function () {
				console.log("error");
			});
	}
}
function edit_status(obj) {
	$.ajax({
		url: location.protocol + "//" + document.domain + "/questions/show/" + obj.attr('data-show')
	})
		.done(function () {
			console.log("success");
		})
		.fail(function () {
			console.log("error");
		});
};
function moreProduct() {
	var label1 = $('<label>').text('Product').appendTo($('#form_product'));
	var product = $('#one_product').clone();
	product.appendTo($('#form_product'));
	var label2 = $('<label>').text('Amout').appendTo($('#form_product'));
	var input = $('<input>').attr({
		type: 'number',
		class: "form-control",
		name: "amount_product"
	}).appendTo($('#form_product'));
}

function moreProductOfflinebill() {
	const div = $('<div>').attr({
		style: 'display: flex;align-items: center;justify-content: space-between;'
	});
	const product = $('#one_product').clone();
	product.appendTo($(div));
	$('<div>').text('x').appendTo($(div));
	$('<input>').attr({
		style: "width: 115px;",
		type:"number",
		class:"form-control ml-2 mr-2",
		name:"amount_product",
		value: 0,
		onchange: "changeUnit($(this))"
	}).appendTo($(div));
	$('<div>').text('=').appendTo($(div));
	$('<div>').attr('class', 'ml-2 total_one').text('00.00d').appendTo($(div));
	div.appendTo($('#form_product'));
}
function handle_order(obj) {
	$.ajax({
		url: '/Invoices/handleOrder',
		type: 'POST',
		data: {
			id_invoice: obj.attr('data-id'),
			id_store: obj.attr('data-store')
		}
	})
		.done(function (res) {
			if (res == 0) {
				$.toast({
					heading: 'Error',
					text: 'Some thing wrong, please check',
					icon: 'error',
					position: 'bottom-right',
					loader: false
				});
				window.location.href = location.protocol + "//" + document.domain + "/admin/onlinebill";
			} else {
				$.toast({
					heading: 'Success',
					text: 'Order is on its way!',
					icon: 'success',
					position: 'bottom-right',
					loader: false
				});
				window.location.href = location.protocol + "//" + document.domain + "/invoices/details/" + obj.attr('data-id');
			}
		})
		.fail(function () {
			$.toast({
				heading: 'Error',
				text: 'Something wrong',
				icon: 'error',
				position: 'bottom-right',
				loader: false
			});
		})
		.always(function () {
		});

}
function submit_edit_genre(obj) {
	$.ajax({
		url: location.protocol + "//" + document.domain + "/admin/editGenre",
		type: 'POST',
		data: {
			genre: obj.parent().prev().children('input').val(),
			id: obj.attr('data-id')
		},
	})
		.done(function (res) {
			location.reload();
		})
		.fail(function () {
			console.log("error");
		})
		.always(function () {
			console.log("complete");
		});
}
function delete_genre(obj) {
	$.ajax({
		url: location.protocol + "//" + document.domain + "/admin/deleteGenre",
		type: 'POST',
		data: {
			id: obj.attr('data-id')
		},
	})
		.done(function (res) {
			location.reload();
		})
		.fail(function () {
			console.log("error");
		})
		.always(function () {
			console.log("complete");
		});
}
function add_store() {
	$.ajax({
		url: 'addStore',
		type: 'POST',
		data: {
			name: $('.name_store').val(),
			address: $('.addr_store').val(),
			phone: $('.phone_store').val(),
			email: $('.mail_store').val(),
			image: $('.image_store').val(),
			pass: $('.pass_store').val(),
			lat: $('.lat_store').val(),
			lng: $('.lng_store').val()
		}
	})
		.done(function (res) {
			location.reload();
		})
		.fail(function () {
			console.log("error");
		});
}
function add_supplier() {
	$.ajax({
		url: location.protocol + "//" + document.domain + "/admin/addSupplier",
		type: 'POST',
		data: {
			name: $('.name_supplier').val(),
			address: $('.address_supplier').val(),
			phone: $('.phone_supplier').val(),
			mail: $('.mail_supplier').val()
		}
	})
		.done(function (res) {
			location.reload();
		})
		.fail(function () {
			console.log("error");
		});
}
function new_invoice_export(obj) {
	const date = $('.date_export_invoice').val();
	const id_receive = $('.id_store_receive').val();
	var id_send = obj.prev().val();
	var datastring = $("#form_product").serializeArray();
	if(date == '' || id_receive == 'Choose...' | datastring[0]['value'] == 'Choose...'){
		$.toast({
			heading: 'Error',
			text: 'Something error, please check!',
			icon: 'error',
			position: 'bottom-right',
			loader: false
		});
	}else{
		$.ajax({
			url: "addExport",
			type: 'POST',
			data: {
				id_sent: id_send,
				id_receive: $('.id_store_receive').val(),
				date: $('.date_export_invoice').val(),
				dataform: datastring
			}
		})
			.done(function (res) {
				console.log(res);
				if (res == 0) {
					$.toast({
						heading: 'Error',
						text: 'Something error, please check!',
						icon: 'error',
						position: 'bottom-right',
						loader: false
					});
				} else {
					$.toast({
						heading: 'Success',
						text: 'Create export success!',
						icon: 'success',
						position: 'bottom-right',
						loader: false
					});
					setTimeout(function () {
						window.location = "../../invoices/exports";
					}, 1500);
				}
			})
			.fail(function () {
				console.log("error");
			});
	}
}

function addImport(obj){
	var datastring = $("#form_product").serializeArray();
	const date = $('.import_date').val();
	const price = $('.import_price').val();
	const id_sent = $('.import_supplier_id').val();
	if(date == '' || price == '' | id_sent == 'Choose...' | datastring[0]['value'] == 'Choose...'){
		$.toast({
			heading: 'Error',
			text: 'Something error, please check!',
			icon: 'error',
			position: 'bottom-right',
			loader: false
		});
	}else{
		$.ajax({
			url: "addImport",
			type: 'POST',
			data: {
				id_receive: obj.prev().val(),
				id_sent: id_sent,
				date: date,
				dataform: datastring,
				price: price
			}
		})
			.done(function (res) {
				location.reload();
			})
			.fail(function () {
				console.log("error");
			});
	}
}

function selectProduct(obj){
	obj.next().next().attr('data-unit', obj.children('option:selected').data('unit'));
}

function changeUnit(obj){
	const price = obj.val() * obj.attr('data-unit');
	obj.next().next().text(price + 'd');
	obj.next().next().attr('data-price', price);
	let total = 0;
	$('.total_one').each(function(index, item) {
		total += parseInt($(item).attr('data-price'));
		console.log($(item));
	});
	$('#total_offline').text(total+'d');
	$('#total_offline').attr('data-price', total);
}

function addImportOffline(obj){
	var datastring = $("#form_product").serializeArray();
	const arr = datastring.map((item, index) => {
		if(item.name == 'name_product' && item.value !== 'Choose...' && datastring[index+1].name == 'amount_product' && datastring[index+1].value !== '0'){
			return item;
		}
		if(item.name == 'amount_product' && item.value !== '0' && datastring[index-1].name == 'name_product' && datastring[index-1].value !== 'Choose...'){
			return item;
		}
	}).filter(n => n);
	const date = $('.import_date').val();
	const id_sent = obj.attr('data-id');
	if(date == '' || arr.length == 0){
		$.toast({
			heading: 'Error',
			text: 'Something error, please check!',
			icon: 'error',
			position: 'bottom-right',
			loader: false
		});
	}else{
		$.ajax({
			url: location.protocol + "//" + document.domain + "/invoices/addImportOffline",
			type: 'POST',
			data: {
				id_sent: id_sent,
				date: date,
				dataform: arr,
				price: $('#total_offline').attr('data-price'),
			}
		})
			.done(function (res) {
				if(res == 'false'){
					$.toast({
						heading: 'Error',
						text: 'Something error, please check!',
						icon: 'error',
						position: 'bottom-right',
						loader: false
					});
				}else{location.reload();}
			})
			.fail(function () {
				console.log("error");
			});
	}
}
function getTotal(day, arr){
	for(i=0; i<arr.length;i++){
		if(day.format('YYYY-MM-DD') == arr[i]['Invoice']['date']){
			return arr[i]['0']['total'];
		}
	}
	return 0;
}
